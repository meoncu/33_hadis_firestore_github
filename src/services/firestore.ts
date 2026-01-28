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
    setDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    serverTimestamp,
    QueryDocumentSnapshot,
    increment,
    runTransaction
} from 'firebase/firestore';
import { db } from './firebase';
import { Hadith, HadithCategory } from '../types/hadith';

const HADITH_COLLECTION = 'hadiths';

export const hadithService = {
    // Public: Get hadiths with infinite scroll
    async getHadiths(params: {
        category?: HadithCategory | 'All',
        lastDoc?: QueryDocumentSnapshot,
        pageSize?: number,
        includeDrafts?: boolean
    }) {
        const { category, lastDoc, pageSize = 12, includeDrafts = false } = params;

        let q = query(
            collection(db, HADITH_COLLECTION),
            limit(pageSize)
        );

        if (!includeDrafts) {
            q = query(q, where('yayinDurumu', '==', 'published'));
        }

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
    },

    // Public: User Like Management
    async hasUserLiked(hadithId: string, userId: string) {
        const likeRef = doc(db, 'likes', `${userId}_${hadithId}`);
        const likeSnap = await getDoc(likeRef);
        return likeSnap.exists();
    },

    async toggleLikeWithUser(hadithId: string, userId: string) {
        const likeRef = doc(db, 'likes', `${userId}_${hadithId}`);
        const hadithRef = doc(db, HADITH_COLLECTION, hadithId);
        const userRef = doc(db, 'users', userId);

        return await runTransaction(db, async (transaction) => {
            // Önce tüm gerekli dokümanları OKUYORUZ (Firestore Transaction kuralıdır)
            const likeSnap = await transaction.get(likeRef);
            const userSnap = await transaction.get(userRef);

            if (likeSnap.exists()) {
                // Beğeniyi kaldır
                transaction.delete(likeRef);
                transaction.update(hadithRef, { likeSayisi: increment(-1) });

                if (userSnap.exists()) {
                    transaction.update(userRef, {
                        totalLikes: increment(-1),
                        lastActivity: serverTimestamp()
                    });
                }
                return false;
            } else {
                // Beğeni ekle
                transaction.set(likeRef, {
                    userId,
                    hadithId,
                    createdAt: serverTimestamp()
                });

                transaction.update(hadithRef, { likeSayisi: increment(1) });

                if (!userSnap.exists()) {
                    transaction.set(userRef, {
                        uid: userId,
                        totalLikes: 1,
                        joinedAt: serverTimestamp(),
                        lastLogin: serverTimestamp(),
                        lastActivity: serverTimestamp(),
                        role: 'user'
                    });
                } else {
                    transaction.update(userRef, {
                        totalLikes: increment(1),
                        lastActivity: serverTimestamp()
                    });
                }
                return true;
            }
        });
    }
};

export const userService = {
    async syncUser(user: any) {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);

        const userData = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            lastLogin: serverTimestamp(),
        };

        if (!userSnap.exists()) {
            await setDoc(userRef, {
                ...userData,
                joinedAt: serverTimestamp(),
                totalLikes: 0,
                role: user.email === 'meoncu@gmail.com' ? 'admin' : 'user'
            });
        } else {
            await updateDoc(userRef, userData);
        }
    },

    async getUsers() {
        const q = query(collection(db, 'users'), orderBy('lastLogin', 'desc'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    async getUserActivities(userId: string) {
        const q = query(
            collection(db, 'likes'),
            where('userId', '==', userId),
            orderBy('createdAt', 'desc'),
            limit(10)
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
};

export const reportService = {
    async addReport(data: {
        hadithId: string;
        userId: string;
        userEmail: string;
        userName: string;
        note: string;
        hadithText: string;
    }) {
        return await addDoc(collection(db, 'reports'), {
            ...data,
            status: 'pending',
            createdAt: serverTimestamp()
        });
    },

    async getReports() {
        const q = query(collection(db, 'reports'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    async updateReportStatus(reportId: string, status: 'pending' | 'resolved' | 'ignored') {
        const docRef = doc(db, 'reports', reportId);
        return await updateDoc(docRef, { status });
    },

    async deleteReport(reportId: string) {
        const docRef = doc(db, 'reports', reportId);
        return await deleteDoc(docRef);
    }
};
