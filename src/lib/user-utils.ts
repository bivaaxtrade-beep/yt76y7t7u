export function mapUserForFrontend(user: any) {
  if (!user) return null;
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.display_name,
    photoURL: user.photo_url,
    balance: parseFloat(user.real_balance || 0),
    demoBalance: parseFloat(user.demo_balance || 10000),
    currency: user.currency || 'USD',
    isVerified: !!user.is_verified,
    isAdmin: !!user.is_admin,
    kycStatus: user.kyc_status || 'unverified',
    affiliateId: user.affiliate_id,
    referralCode: user.referral_code,
    referralCount: user.referral_count || 0,
    totalLiveVolume: parseFloat(user.total_live_volume || 0),
    status: user.status || 'Standard',
    phone: user.phone,
    country: user.country,
    referredBy: user.referred_by_uid
  };
}
