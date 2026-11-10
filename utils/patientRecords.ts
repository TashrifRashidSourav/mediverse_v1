import { db } from '../firebase';

/**
 * Fetch every document in `appointments` / `prescriptions` that belongs to a
 * patient across all hospitals.
 *
 * Fast path: one collection-group query. If that is not available yet (the
 * collection-group index has not been created), fall back to querying each
 * hospital, but only the approved ones, so it still works.
 */
export async function fetchPatientRecords<T extends { id: string }>(
    collectionName: 'appointments' | 'prescriptions',
    authUid: string
): Promise<T[]> {
    try {
        const snap = await db.collectionGroup(collectionName).where('authUid', '==', authUid).get();
        return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as unknown as T));
    } catch (err: any) {
        if (err?.code !== 'failed-precondition' && err?.code !== 'permission-denied') throw err;
        console.warn(`[${collectionName}] collection-group query unavailable, falling back.`, err?.message);
    }

    const hospitals = await db.collection('users').where('status', '==', 'approved').get();
    const results = await Promise.all(
        hospitals.docs.map(h =>
            db.collection('users').doc(h.id).collection(collectionName).where('authUid', '==', authUid).get()
        )
    );
    return results.flatMap(s => s.docs.map(doc => ({ id: doc.id, ...doc.data() } as unknown as T)));
}
