'use client';

import { useState, useEffect } from 'react';
import { auth } from '@/services/firebase';
import {
    onAuthStateChanged,
    User,
    signInWithPopup,
    GoogleAuthProvider,
    signOut
} from 'firebase/auth';
import { useRouter } from 'next/navigation';

export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const { userService } = await import('@/services/firestore');
                await userService.syncUser(user);
            }
            setUser(user);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const loginWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });

        try {
            const result = await signInWithPopup(auth, provider);

            // Eğer giriş yapan admin ise panele gönder, değilse olduğu yerde kalsın (beğeni yapabilmesi için)
            if (result.user.email === 'meoncu@gmail.com') {
                router.push('/admin/dashboard');
            } else {
                // Normal kullanıcılar için sayfayı yenilemek veya olduğu yerde bırakmak yeterli
                console.log("Normal kullanıcı girişi başarılı:", result.user.email);
            }
        } catch (error: any) {
            console.error('Login error:', error);
            alert(`Giriş hatası: ${error.message}`);
        }
    };

    const logout = async () => {
        await signOut(auth);
        router.push('/');
    };

    return { user, loading, loginWithGoogle, logout };
}
