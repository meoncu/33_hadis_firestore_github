'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { hadithService } from '@/services/firestore';
import { Hadith } from '@/types/hadith';
import { Loader2, ArrowLeft, Share2, Heart, Calendar, BookOpen, Quote } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { motion } from 'framer-motion';

export default function HadithDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [hadith, setHadith] = useState<Hadith | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            hadithService.getHadithById(id as string).then(res => {
                setHadith(res);
                setLoading(false);
            });
        }
    }, [id]);

    if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-500" size={48} /></div>;
    if (!hadith) return <div className="min-h-screen flex items-center justify-center text-slate-400">Hadis bulunamadı.</div>;

    return (
        <main className="min-h-screen pt-12 pb-20 px-6">
            <div className="max-w-4xl mx-auto">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors group"
                >
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    Geri Dön
                </button>

                <motion.article
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card p-8 md:p-12 relative overflow-hidden"
                >
                    {/* Background Highlight */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />

                    <div className="relative z-10">
                        <Quote className="text-blue-500/20 mb-6" size={60} />

                        <h1 className="text-2xl md:text-4xl font-serif italic text-white leading-relaxed mb-12">
                            "{hadith.metin}"
                        </h1>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-slate-800 pt-8">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 text-slate-300">
                                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center">
                                        <BookOpen size={18} className="text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 uppercase tracking-tighter">Kaynak</p>
                                        <p className="font-medium">{hadith.kaynak}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 text-slate-300">
                                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center">
                                        <Calendar size={18} className="text-indigo-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 uppercase tracking-tighter">Eklenme Tarihi</p>
                                        <p className="font-medium">{formatDate(hadith.eklemeTarihi)}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-800/50">
                                <p className="text-xs text-slate-500 uppercase tracking-tighter mb-4">Etiketler</p>
                                <div className="flex flex-wrap gap-2">
                                    <span className="px-3 py-1 bg-blue-500/10 text-blue-400 text-xs font-semibold rounded-full border border-blue-500/20">
                                        {hadith.kategori}
                                    </span>
                                    {hadith.etiketler?.map(tag => (
                                        <span key={tag} className="px-3 py-1 bg-slate-800 text-slate-400 text-xs rounded-full border border-slate-700">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 flex items-center justify-between border-t border-slate-800 pt-8">
                            <div className="flex items-center gap-6">
                                <button className="flex items-center gap-2 text-slate-400 hover:text-red-400">
                                    <Heart size={24} />
                                    <span className="font-bold">{hadith.likeSayisi || 0}</span>
                                </button>
                                <div className="text-sm text-slate-500">
                                    <span className="font-bold text-slate-300">{hadith.goruntulenme || 0}</span> Görüntülenme
                                </div>
                            </div>
                            <button className="btn-primary">
                                <Share2 size={20} />
                                Paylaş
                            </button>
                        </div>
                    </div>
                </motion.article>
            </div>
        </main>
    );
}
