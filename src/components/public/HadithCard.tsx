'use client';

import { Hadith } from '@/types/hadith';
import { motion } from 'framer-motion';
import { Share2, Heart, BookOpen, User } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

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
            // Fallback: Copy to clipboard
            navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
            alert('Hadis ve link kopyalandı!');
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
            className={cn("glass-card overflow-hidden flex flex-col h-full", className)}
        >
            <div className="p-6 flex-1 flex flex-col">
                {/* Category Badge */}
                <div className="flex justify-between items-start mb-4">
                    <span className="px-3 py-1 bg-blue-500/10 text-blue-400 text-xs font-semibold rounded-full border border-blue-500/20">
                        {hadith.kategori}
                    </span>
                    {hadith.resimUrl && (
                        <div className="h-10 w-10 rounded-lg overflow-hidden border border-slate-700">
                            <img src={hadith.resimUrl} alt="Hadis görseli" className="h-full w-full object-cover" />
                        </div>
                    )}
                </div>

                {/* Text */}
                <p className="text-lg md:text-xl font-serif italic text-slate-100 mb-6 leading-relaxed line-clamp-6">
                    "{hadith.metin}"
                </p>

                {/* Info */}
                <div className="mt-auto space-y-2">
                    {hadith.ravi && (
                        <div className="flex items-center gap-2 text-slate-400 text-sm">
                            <User size={14} className="text-blue-500" />
                            <span>{hadith.ravi}</span>
                        </div>
                    )}
                    <div className="flex items-center gap-2 text-slate-500 text-xs font-medium uppercase tracking-wider">
                        <BookOpen size={14} className="text-blue-500" />
                        <span>{hadith.kaynak}</span>
                    </div>
                </div>
            </div>

            {/* Footer Actions */}
            <div className="px-6 py-4 border-t border-slate-800 flex items-center justify-between bg-slate-900/20">
                <div className="flex items-center gap-4">
                    <button className="flex items-center gap-1.5 text-slate-400 hover:text-red-400 transition-colors">
                        <Heart size={18} />
                        <span className="text-sm">{hadith.likeSayisi || 0}</span>
                    </button>
                    <button
                        onClick={handleShare}
                        className="flex items-center gap-1.5 text-slate-400 hover:text-blue-400 transition-colors"
                    >
                        <Share2 size={18} />
                        <span className="text-sm">Paylaş</span>
                    </button>
                </div>

                <Link
                    href={`/hadis/${hadith.id}`}
                    className="text-sm text-blue-500 hover:text-blue-400 font-medium"
                >
                    Detayları Gör →
                </Link>
            </div>
        </motion.div>
    );
}
