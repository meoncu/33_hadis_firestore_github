'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { hadithService } from '@/services/firestore';
import { Hadith } from '@/types/hadith';
import { Loader2, ArrowLeft, Share2, Heart, Calendar, BookOpen, Quote, Hash, User } from 'lucide-react';
import { formatDate, getProxyUrl } from '@/lib/utils';
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

    const handleShare = async () => {
        if (!hadith) return;
        const shareData = {
            title: `Hadis #${hadith.siraNo || ''}`,
            text: `${hadith.metin}\n\nKaynak: ${hadith.kaynak}`,
            url: window.location.href,
        };

        if (navigator.share) {
            try { await navigator.share(shareData); } catch (err) { console.error(err); }
        } else {
            navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
            alert('Kopyalandı!');
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-500" size={48} /></div>;
    if (!hadith) return <div className="min-h-screen flex items-center justify-center text-slate-400">Hadis bulunamadı.</div>;

    return (
        <main className="min-h-screen pt-12 pb-20 px-6 bg-[#050a14]">
            <div className="max-w-4xl mx-auto">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors group"
                >
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="font-medium tracking-wide">Geri Dön</span>
                </button>

                <motion.article
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card overflow-hidden"
                >
                    {/* Hero Image Section */}
                    {hadith.resimUrl && (
                        <div className="w-full h-[400px] relative">
                            <img
                                src={getProxyUrl(hadith.resimUrl)}
                                alt="Hadis görseli"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/1200x800?text=Resim+Yuklenemedi';
                                }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                            {hadith.siraNo && (
                                <div className="absolute top-6 left-6 px-4 py-2 bg-blue-600/90 text-white rounded-xl backdrop-blur-md shadow-2xl flex items-center gap-2 font-bold font-outfit border border-blue-400/30">
                                    <Hash size={18} />
                                    <span className="text-xl">{hadith.siraNo}</span>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="p-8 md:p-12 relative">
                        {!hadith.resimUrl && hadith.siraNo && (
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 text-blue-400 rounded-xl mb-8 font-bold font-outfit border border-blue-500/20">
                                <Hash size={18} />
                                <span className="text-xl">{hadith.siraNo}</span>
                            </div>
                        )}

                        <Quote className="text-blue-500/20 mb-6" size={60} />

                        <h1 className="text-2xl md:text-5xl font-serif italic text-white leading-relaxed mb-12">
                            "{hadith.metin}"
                        </h1>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-slate-800 pt-8 mt-12">
                            <div className="space-y-6">
                                {hadith.ravi && (
                                    <div className="flex items-center gap-4 text-slate-300">
                                        <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                                            <User size={20} className="text-blue-400" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold">Ravi</p>
                                            <p className="font-semibold text-lg">{hadith.ravi}</p>
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center gap-4 text-slate-300">
                                    <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                                        <BookOpen size={20} className="text-indigo-400" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold">Kaynak</p>
                                        <p className="font-semibold text-lg">{hadith.kaynak}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-800/80">
                                <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold mb-4">Detaylar</p>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-500 text-sm">Kategori:</span>
                                        <span className="px-3 py-1 bg-blue-500/10 text-blue-400 text-xs font-bold rounded-lg border border-blue-500/20">
                                            {hadith.kategori}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-500 text-sm">Tarih:</span>
                                        <span className="text-slate-300 text-sm font-medium">{formatDate(hadith.eklemeTarihi)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 flex flex-col md:flex-row md:items-center justify-between gap-6 border-t border-slate-800 pt-8">
                            <div className="flex items-center gap-8">
                                <button className="flex items-center gap-2.5 text-slate-400 hover:text-red-400 transition-colors group/heart">
                                    <Heart size={28} className="group-hover/heart:fill-red-400" />
                                    <span className="text-xl font-bold">{hadith.likeSayisi || 0}</span>
                                </button>
                                <div className="h-8 w-[1px] bg-slate-800 hidden md:block" />
                                <div className="text-slate-500">
                                    <span className="font-bold text-slate-300 text-lg">{hadith.goruntulenme || 0}</span>
                                    <span className="ml-2 text-sm uppercase tracking-wide">Görüntülenme</span>
                                </div>
                            </div>
                            <button onClick={handleShare} className="btn-primary w-full md:w-auto px-10 py-4 text-lg">
                                <Share2 size={22} />
                                Paylaş
                            </button>
                        </div>
                    </div>
                </motion.article>
            </div>
        </main>
    );
}
