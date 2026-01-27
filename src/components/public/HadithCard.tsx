'use client';

import { Hadith } from '@/types/hadith';
import { motion } from 'framer-motion';
import { Share2, Heart, BookOpen, User, Hash } from 'lucide-react';
import Link from 'next/link';
import { cn, getProxyUrl } from '@/lib/utils';

interface HadithCardProps {
    hadith: Hadith;
    className?: string;
}

export default function HadithCard({ hadith, className }: HadithCardProps) {
    const handleShare = async () => {
        const shareData = {
            title: 'Bir Hadis',
            text: `${hadith.metin}\n\nKaynak: ${hadith.kaynak}\nRavi: ${hadith.ravi}`,
            url: window.location.origin + `/hadis/${hadith.id}`,
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                console.error('Paylaşım hatası:', err);
            }
        } else {
            navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
            alert('Hadis ve link kopyalandı!');
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
            className={cn("glass-card overflow-hidden flex flex-col h-full group", className)}
        >
            {/* Image Section */}
            {hadith.resimUrl && (
                <div className="relative h-48 w-full overflow-hidden border-b border-slate-800">
                    <img
                        src={getProxyUrl(hadith.resimUrl)}
                        alt="Hadis görseli"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/600x400?text=Resim+Yuklenemedi';
                        }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
                </div>
            )}

            <div className="p-6 flex-1 flex flex-col">
                {/* Category & SiraNo Header */}
                <div className="flex justify-between items-center mb-4">
                    <span className="px-3 py-1 bg-blue-500/10 text-blue-400 text-xs font-bold rounded-full border border-blue-500/20 uppercase tracking-wider">
                        {hadith.kategori}
                    </span>
                    {hadith.siraNo && (
                        <div className="flex items-center gap-1 text-slate-500 font-bold font-outfit text-sm">
                            <Hash size={12} className="text-blue-500" />
                            <span>{hadith.siraNo}</span>
                        </div>
                    )}
                </div>

                {/* Text */}
                <p className="text-lg md:text-xl font-serif italic text-slate-100 mb-6 leading-relaxed line-clamp-6 flex-1">
                    "{hadith.metin}"
                </p>

                {/* Info */}
                <div className="space-y-2 mt-auto">
                    {hadith.ravi && (
                        <div className="flex items-center gap-2 text-slate-400 text-sm">
                            <User size={14} className="text-blue-500" />
                            <span className="font-medium">{hadith.ravi}</span>
                        </div>
                    )}
                    <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold uppercase tracking-widest">
                        <BookOpen size={14} className="text-blue-500" />
                        <span>{hadith.kaynak}</span>
                    </div>
                </div>
            </div>

            {/* Footer Actions */}
            <div className="px-6 py-4 border-t border-slate-800/50 flex items-center justify-between bg-slate-900/40">
                <div className="flex items-center gap-4">
                    <button className="flex items-center gap-1.5 text-slate-400 hover:text-red-400 transition-colors group/heart">
                        <Heart size={18} className="group-hover/heart:fill-red-400" />
                        <span className="text-sm font-medium">{hadith.likeSayisi || 0}</span>
                    </button>
                    <button
                        onClick={handleShare}
                        className="flex items-center gap-1.5 text-slate-400 hover:text-blue-400 transition-colors"
                    >
                        <Share2 size={18} />
                        <span className="text-sm font-medium">Paylaş</span>
                    </button>
                </div>

                <Link
                    href={`/hadis/${hadith.id}`}
                    className="text-sm text-blue-400 hover:text-blue-300 font-bold tracking-wide transition-colors"
                >
                    Detaylar →
                </Link>
            </div>
        </motion.div>
    );
}
