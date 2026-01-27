import {
    collection,
    query,
    where,
    orderBy,
    limit,
    startAfter,
    getDocs,
    doc,
    getDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    serverTimestamp,
    QueryDocumentSnapshot,
    increment
} from 'firebase/firestore';
import { db } from './firebase';
import { Hadith, HadithCategory } from '../types/hadith';

const HADITH_COLLECTION = 'hadiths';

export const hadithService = {
    // Public: Get hadiths with infinite scroll
    async getHadiths(params: {
        category?: HadithCategory | 'All',
        lastDoc?: QueryDocumentSnapshot,
        pageSize?: number
    }) {
        const { category, lastDoc, pageSize = 12 } = params;

        let q = query(
            collection(db, HADITH_COLLECTION),
            where('yayinDurumu', '==', 'published'),
            // orderBy('eklemeTarihi', 'desc'),
            limit(pageSize)
        );

        if (category && category !== 'All') {
            q = query(q, where('kategori', '==', category));
        }

        if (lastDoc) {
            q = query(q, startAfter(lastDoc));
        }

        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Hadith));

        return {
            data,
            lastDoc: snapshot.docs[snapshot.docs.length - 1]
        };
    },

    // Public: Get single hadith
    async getHadithById(id: string) {
        const docRef = doc(db, HADITH_COLLECTION, id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            // Increment view count asynchronously
            updateDoc(docRef, { goruntulenme: increment(1) });
            return { id: docSnap.id, ...docSnap.data() } as Hadith;
        }
        return null;
    },

    // Admin: CRUD
    async addHadith(data: Omit<Hadith, 'id' | 'eklemeTarihi'>) {
        return await addDoc(collection(db, HADITH_COLLECTION), {
            ...data,
            eklemeTarihi: serverTimestamp(),
            goruntulenme: 0,
            likeSayisi: 0
        });
    },

    async updateHadith(id: string, data: Partial<Hadith>) {
        const docRef = doc(db, HADITH_COLLECTION, id);
        return await updateDoc(docRef, data);
    },

    async deleteHadith(id: string) {
        const docRef = doc(db, HADITH_COLLECTION, id);
        return await deleteDoc(docRef);
    },

    async toggleLike(id: string, amount: number) {
        const docRef = doc(db, HADITH_COLLECTION, id);
        return await updateDoc(docRef, { likeSayisi: increment(amount) });
    }
};
