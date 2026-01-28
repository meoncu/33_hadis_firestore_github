'use client';

import { useState } from 'react';
import { Hadith } from '@/types/hadith';
import { useAuth } from '@/hooks/useAuth';
import { reportService } from '@/services/firestore';
import { AlertTriangle, Send, X, Loader2, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ReportModalProps {
    hadith: Hadith;
    isOpen: boolean;
    onClose: () => void;
}

export default function ReportModal({ hadith, isOpen, onClose }: ReportModalProps) {
    const { user, loginWithGoogle } = useAuth();
    const [note, setNote] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            loginWithGoogle();
            return;
        }

        if (note.length < 5) return;

        setLoading(true);
        try {
            await reportService.addReport({
                hadithId: hadith.id!,
                hadithText: hadith.metin,
                userId: user.uid,
                userEmail: user.email || '',
                userName: user.displayName || 'Anonim',
                note: note
            });
            setSuccess(true);
            setTimeout(() => {
                onClose();
                setSuccess(false);
                setNote('');
            }, 2000);
        } catch (error) {
            console.error('Report error:', error);
            alert('Bildirim gönderilirken bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center p-6">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-[#050a14]/90 backdrop-blur-md"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl"
                    >
                        {!user ? (
                            <div className="p-12 text-center">
                                <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <AlertTriangle className="text-amber-500" size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Giriş Yapmalısınız</h3>
                                <p className="text-slate-400 mb-8">Hata bildirmek için lütfen Google hesabınızla giriş yapın.</p>
                                <button
                                    onClick={() => loginWithGoogle()}
                                    className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-blue-600/20"
                                >
                                    Google ile Giriş Yap
                                </button>
                                <button onClick={onClose} className="mt-4 text-slate-500 hover:text-white transition-colors">Vazgeç</button>
                            </div>
                        ) : success ? (
                            <div className="p-12 text-center">
                                <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <CheckCircle2 className="text-emerald-500" size={40} />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2 font-outfit">Teşekkürler!</h3>
                                <p className="text-slate-400">Bildiriminiz yöneticiye iletildi. Hassasiyetiniz için teşekkür ederiz.</p>
                            </div>
                        ) : (
                            <>
                                <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                        <AlertTriangle className="text-amber-500" size={20} />
                                        Hata Bildir / Not Ekle
                                    </h3>
                                    <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
                                        <X size={24} />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                                    <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-800">
                                        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-2">İlgili Hadis</p>
                                        <p className="text-slate-300 text-sm italic line-clamp-3">"{hadith.metin}"</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-2">Notunuz / Hata detayı</label>
                                        <textarea
                                            required
                                            value={note}
                                            onChange={(e) => setNote(e.target.value)}
                                            placeholder="Bu hadis ile ilgili tespit ettiğiniz hatayı veya notu buraya yazın..."
                                            className="w-full h-32 bg-slate-800 border-slate-700 rounded-2xl p-4 text-white focus:ring-2 focus:ring-blue-600 outline-none resize-none transition-all placeholder:text-slate-600"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading || note.length < 5}
                                        className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:bg-slate-700 text-white py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
                                    >
                                        {loading ? <Loader2 className="animate-spin" /> : <Send size={20} />}
                                        Bildirimi Gönder
                                    </button>
                                </form>
                            </>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
