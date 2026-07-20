import { db } from '../firebase';
import { doc, runTransaction, collection, query, where, getDocs, limit, updateDoc, increment, addDoc } from '../firebase';

/**
 * Generates a sequential professional numeric ID for a new user.
 */
export async function getNextAffiliateId(): Promise<number> {
  try {
    const res = await fetch('/api/affiliate/next-id', {
      method: 'POST'
    });
    if (!res.ok) {
        throw new Error("Failed to get next ID from backend");
    }
    const data = await res.json();
    return data.nextId;
  } catch (err) {
    console.error("Failed to get next affiliate ID, using fallback numeric suffix", err);
    // Fallback: use a number derived from characters to keep it professional-ish if transaction fails
    return 10000 + Math.floor(Math.random() * 90000);
  }
}

/**
 * Finds a user by their numeric affiliate ID.
 */
export async function getUserByAffiliateId(id: string | number) {
  const numericId = typeof id === 'string' ? parseInt(id) : id;
  if (isNaN(numericId)) return null;

  const q = query(
    collection(db, 'users'), 
    where('affiliateId', '==', numericId), 
    limit(1)
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return { uid: snap.docs[0].id, ...snap.docs[0].data() };
}

/**
 * Processes revenue share when a referred user loses a trade.
 * Bivaax model: Referrer gets a share of the lost amount.
 */
export async function processRevenueShare(userId: string, lostAmount: number, currency: string) {
  try {
    const userSnap = await getDocs(query(collection(db, 'users'), where('uid', '==', userId), limit(1)));
    if (userSnap.empty) {
        // If query by uid fails (depending on how it's stored), try direct doc
        const userDoc = await getDocs(query(collection(db, 'users'), where('email', '!=', ''), limit(1))); // dummy but better use standard doc
    }
    
    // Better: just use the userId directly if we have it
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDocs(query(collection(db, 'users'), where('__name__', '==', userId), limit(1)));
    if (userDoc.empty) return;
    
    const userData = userDoc.docs[0].data();
    if (!userData.referredByUid) return;

    const referrerUid = userData.referredByUid;
    const referrerRef = doc(db, 'users', referrerUid);
    const referrerSnap = await getDocs(query(collection(db, 'users'), where('__name__', '==', referrerUid), limit(1)));
    
    if (referrerSnap.empty) return;
    const referrerData = referrerSnap.docs[0].data();

    // Determine share percentage (default 50% or from tier)
    let sharePercent = 50;
    if (referrerData.customAffiliateShare) {
        sharePercent = referrerData.customAffiliateShare;
    } else {
        // Basic tier logic
        const refCount = referrerData.referralCount || 0;
        if (refCount >= 201) sharePercent = 80;
        else if (refCount >= 51) sharePercent = 70;
        else if (refCount >= 11) sharePercent = 60;
    }

    const shareAmount = lostAmount * (sharePercent / 100);

    // Update referrer balance
    await updateDoc(referrerRef, {
      affiliateBalance: increment(shareAmount),
      totalAffiliateEarnings: increment(shareAmount)
    });

    // Log the commission
    await addDoc(collection(db, 'affiliate_commissions'), {
        referrerUid,
        referredUid: userId,
        amount: shareAmount,
        lostAmount: lostAmount,
        currency: currency,
        percent: sharePercent,
        createdAt: Date.now(),
        type: 'revenue_share'
    });

  } catch (err) {
    console.error("Error processing revenue share:", err);
  }
}
