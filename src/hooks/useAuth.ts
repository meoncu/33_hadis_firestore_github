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
        // Prompting for account selection to avoid auto-closing in some cached states
        provider.setCustomParameters({ prompt: 'select_account' });

        try {
            console.log("Firebase Config check:", {
                apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? "Defined" : "MISSING",
                projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? "Defined" : "MISSING"
            });
            console.log("Starting Google Login...");
            const result = await signInWithPopup(auth, provider);
            console.log("Login Success:", result.user.email);
            router.push('/admin/dashboard');
        } catch (error: any) {
            console.error('Login error detail:', error.code, error.message);
            alert(`Giriş hatası: ${error.message}\nKod: ${error.code}`);
        }
    };

    const logout = async () => {
        await signOut(auth);
        router.push('/');
    };

    return { user, loading, loginWithGoogle, logout };
}
