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
    runTransaction,
    writeBatch
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
        const { category, lastDoc, pageSize = 20, includeDrafts = true } = params;

        let constraints: any[] = [];

        if (!includeDrafts) {
            constraints.push(where('yayinDurumu', '==', 'published'));
        }

        if (category && category !== 'All') {
            constraints.push(where('kategori', '==', category));
        }

        if (lastDoc) {
            constraints.push(startAfter(lastDoc));
        }

        constraints.push(limit(pageSize));

        try {
            const q = query(collection(db, HADITH_COLLECTION), ...constraints);
            const snapshot = await getDocs(q);
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Hadith));

            // Sola dayalı düzenli sıra no sıralaması
            data.sort((a, b) => (a.siraNo || 0) - (b.siraNo || 0));

            return {
                data,
                lastDoc: snapshot.docs[snapshot.docs.length - 1]
            };
        } catch (error) {
            console.error('Firestore getHadiths query error:', error);
            // Fallback query (Basit liste çekimi)
            const fallbackQ = query(collection(db, HADITH_COLLECTION), limit(pageSize));
            const snapshot = await getDocs(fallbackQ);
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Hadith));
            data.sort((a, b) => (a.siraNo || 0) - (b.siraNo || 0));

            return {
                data,
                lastDoc: snapshot.docs[snapshot.docs.length - 1]
            };
        }
    },

    // Exact Page-based retrieval (Preserves order & allows direct navigation)
    async getPageHadiths(params: {
        page: number,
        pageSize?: number,
        category?: HadithCategory | 'All'
    }) {
        const { page = 1, pageSize = 20, category } = params;

        try {
            if (!category || category === 'All') {
                const startSiraNo = (page - 1) * pageSize + 1;
                const endSiraNo = page * pageSize;
                const q = query(
                    collection(db, HADITH_COLLECTION),
                    where('siraNo', '>=', startSiraNo),
                    where('siraNo', '<=', endSiraNo),
                    orderBy('siraNo', 'asc')
                );
                const snapshot = await getDocs(q);
                const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Hadith));
                data.sort((a, b) => (a.siraNo || 0) - (b.siraNo || 0));
                return { data, hasMore: data.length === pageSize };
            } else {
                const q = query(
                    collection(db, HADITH_COLLECTION),
                    where('kategori', '==', category),
                    limit(pageSize * page)
                );
                const snapshot = await getDocs(q);
                let data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Hadith));
                data.sort((a, b) => (a.siraNo || 0) - (b.siraNo || 0));
                const startIndex = (page - 1) * pageSize;
                const pageData = data.slice(startIndex, startIndex + pageSize);
                return { data: pageData, hasMore: pageData.length === pageSize };
            }
        } catch (error) {
            console.error('getPageHadiths error:', error);
            try {
                const fallbackQ = query(collection(db, HADITH_COLLECTION), limit(pageSize * page));
                const snapshot = await getDocs(fallbackQ);
                let data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Hadith));
                data.sort((a, b) => (a.siraNo || 0) - (b.siraNo || 0));
                const startIndex = (page - 1) * pageSize;
                const pageData = data.slice(startIndex, startIndex + pageSize);
                return { data: pageData, hasMore: pageData.length === pageSize };
            } catch (fallbackErr) {
                return { data: [], hasMore: false };
            }
        }
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

    // User Read Tracking (Dual Storage: LocalStorage Instant Cache + Firestore Sync)
    async markHadithAsRead(hadithId: string, userId: string, siraNo?: number) {
        if (!hadithId) return;

        // 1. Save to LocalStorage immediately for instant refresh persistence
        try {
            const cacheKey = `read_hadiths_${userId || 'guest'}`;
            const cached = localStorage.getItem(cacheKey);
            const list: string[] = cached ? JSON.parse(cached) : [];
            if (!list.includes(hadithId)) list.push(hadithId);
            if (siraNo && !list.includes(`sira_${siraNo}`)) list.push(`sira_${siraNo}`);
            if (siraNo && !list.includes(String(siraNo))) list.push(String(siraNo));
            localStorage.setItem(cacheKey, JSON.stringify(list));
        } catch (e) {
            console.error('LocalStorage save error:', e);
        }

        // 2. Sync to Firestore in background if logged in
        if (userId) {
            try {
                const readRef = doc(db, 'users', userId, 'readHadiths', hadithId);
                await setDoc(readRef, {
                    readAt: serverTimestamp(),
                    hadithId,
                    siraNo
                }, { merge: true });

                if (siraNo) {
                    const altRef = doc(db, 'users', userId, 'readHadiths', `sira_${siraNo}`);
                    await setDoc(altRef, { readAt: serverTimestamp(), hadithId, siraNo }, { merge: true });
                }
            } catch (error) {
                console.error('Error syncing hadith read to Firestore:', error);
            }
        }
    },

    async getUserReadHadithIds(userId: string): Promise<Set<string>> {
        const ids = new Set<string>();

        // 1. Instantly load from LocalStorage cache
        try {
            const cacheKey = `read_hadiths_${userId || 'guest'}`;
            const cached = localStorage.getItem(cacheKey);
            if (cached) {
                const list: string[] = JSON.parse(cached);
                list.forEach(id => ids.add(id));
            }
        } catch (e) {
            console.error('LocalStorage read error:', e);
        }

        // 2. Fetch from Firestore if logged in and merge
        if (userId) {
            try {
                const snapshot = await getDocs(collection(db, 'users', userId, 'readHadiths'));
                snapshot.docs.forEach(d => {
                    ids.add(d.id);
                    const data = d.data();
                    if (data.hadithId) ids.add(data.hadithId);
                    if (data.siraNo !== undefined) {
                        ids.add(`sira_${data.siraNo}`);
                        ids.add(String(data.siraNo));
                    }
                });

                // Update LocalStorage cache with merged Firestore records
                localStorage.setItem(`read_hadiths_${userId}`, JSON.stringify(Array.from(ids)));
            } catch (error) {
                console.error('Error fetching read hadiths from Firestore:', error);
            }
        }

        return ids;
    },

    async resetUserReadHistory(userId: string) {
        // Clear LocalStorage cache
        try {
            localStorage.removeItem(`read_hadiths_${userId || 'guest'}`);
        } catch (e) {}

        if (!userId) return;
        try {
            const snapshot = await getDocs(collection(db, 'users', userId, 'readHadiths'));
            const batch = writeBatch(db);
            snapshot.docs.forEach(docSnap => {
                batch.delete(docSnap.ref);
            });
            await batch.commit();
        } catch (error) {
            console.error('Error resetting read history:', error);
            throw error;
        }
    },

    getUniqueReadCount(readSet: Set<string>): number {
        let count = 0;
        readSet.forEach(id => {
            if (!id.startsWith('sira_') && isNaN(Number(id))) {
                count++;
            }
        });
        return count;
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
