'use client';

import { useAuth } from '@/hooks/useAuth';
import { Book, LogIn } from 'lucide-react';

export default function LoginPage() {
    const { loginWithGoogle, user } = useAuth();

    if (user) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6">
                <div className="text-center space-y-4">
                    <p className="text-slate-400">Zaten giriş yaptınız.</p>
                    <a href="/admin/dashboard" className="btn-primary">Panele Git</a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-[#050a14]">
            <div className="w-full max-w-md space-y-8 glass-card p-12 text-center">
                <div className="inline-flex p-4 bg-blue-600 rounded-2xl shadow-xl shadow-blue-500/30 mb-4">
                    <Book className="text-white" size={40} />
                </div>
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold text-white tracking-tight">Yönetici Girişi</h1>
                    <p className="text-slate-500">Hadis portalı içerik yönetimi için lütfen giriş yapın.</p>
                </div>

                <button
                    onClick={loginWithGoogle}
                    className="w-full mt-8 flex items-center justify-center gap-3 py-4 bg-white text-slate-900 rounded-2xl font-bold hover:bg-slate-100 transition-all active:scale-[0.98]"
                >
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-6 h-6" alt="Google" />
                    Google ile Giriş Yap
                </button>

                <p className="text-xs text-slate-600 mt-8">
                    Bu alan sadece yetkili adminler içindir. Giriş yaparak kullanım şartlarını kabul etmiş sayılırsınız.
                </p>
            </div>
        </div>
    );
}
