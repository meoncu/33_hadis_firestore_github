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
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const loginWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
            router.push('/admin/dashboard');
        } catch (error) {
            console.error('Login error:', error);
        }
    };

    const logout = async () => {
        await signOut(auth);
        router.push('/');
    };

    return { user, loading, loginWithGoogle, logout };
}
