import { db } from '../firebase';
export async function getNextAffiliateId(): Promise<number> {
    try {
        const res = await fetch('/api/affiliate/next-id', {
            method: 'POST'
        });
        const data = await res.json();
        return data.nextId;
    } catch(err) {
        console.error("Failed to get next affiliate ID", err);
        return 10000 + Math.floor(Math.random() * 90000);
    }
}
