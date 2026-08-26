'use client';

import { Hadith } from '@/types/hadith';
import { motion } from 'framer-motion';
import { Share2, Heart, BookOpen, User, Hash, Loader2, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { cn, getProxyUrl } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { hadithService } from '@/services/firestore';
import { useState, useEffect } from 'react';
import ReportModal from './ReportModal';

interface HadithCardProps {
    hadith: Hadith;
    className?: string;
}

export default function HadithCard({ hadith, className }: HadithCardProps) {
    const { user, loginWithGoogle } = useAuth();
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(hadith.likeSayisi || 0);
    const [isLikeLoading, setIsLikeLoading] = useState(false);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);

    useEffect(() => {
        if (user && hadith.id) {
            hadithService.hasUserLiked(hadith.id, user.uid).then(setIsLiked);
        } else {
            setIsLiked(false);
        }
    }, [user, hadith.id]);

    const handleLike = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) {
            if (confirm('Hadisleri beğenmek için giriş yapmalısınız. Giriş yapmak ister misiniz?')) {
                loginWithGoogle();
            }
            return;
        }

        if (!hadith.id || isLikeLoading) return;

        setIsLikeLoading(true);
        try {
            const liked = await hadithService.toggleLikeWithUser(hadith.id, user.uid);
            setIsLiked(liked);
            setLikeCount(prev => liked ? prev + 1 : prev - 1);
        } catch (error: any) {
            console.error('Like error:', error);
            alert('Beğeni işlemi sırasında bir hata oluştu: ' + (error.message || 'Bilinmeyen hata'));
        } finally {
            setIsLikeLoading(false);
        }
    };

    const handleShare = async (e?: React.MouseEvent) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
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
        <>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -5 }}
                className={cn("glass-card overflow-hidden flex flex-col h-full group", className)}
            >
                {/* Image Section */}
                {hadith.resimUrl && (
                    <div className="relative h-40 md:h-48 w-full overflow-hidden border-b border-slate-800">
                        <img
                            src={getProxyUrl(hadith.resimUrl)}
                            alt="Hadis görseli"
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/600x400?text=Resim+Yuklenemedi';
                            }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent" />
                    </div>
                )}

                <div className="p-4 md:p-6 flex-1 flex flex-col">
                    {/* Category & SiraNo Header */}
                    <div className="flex justify-between items-center mb-3">
                        <span className="px-2 py-0.5 bg-blue-500/5 text-blue-400/80 text-[10px] md:text-xs font-bold rounded-md border border-blue-500/10 uppercase tracking-tighter md:tracking-wider">
                            {hadith.kategori}
                        </span>
                        {hadith.siraNo && (
                            <div className="flex items-center gap-1 text-slate-600 font-bold text-xs md:text-sm">
                                <Hash size={10} className="text-blue-500/50" />
                                <span>{hadith.siraNo}</span>
                            </div>
                        )}
                    </div>

                    {/* Text */}
                    {hadith.metinArapca && (
                        <p dir="rtl" className="text-lg md:text-2xl font-serif text-amber-200/90 mb-3 leading-loose line-clamp-3 text-right">
                            {hadith.metinArapca}
                        </p>
                    )}
                    <p className="text-base md:text-xl font-medium text-slate-200 mb-5 leading-relaxed line-clamp-6 flex-1">
                        "{hadith.metin}"
                    </p>

                    {/* Info */}
                    <div className="space-y-1.5 mt-auto">
                        {hadith.ravi && (
                            <div className="flex items-center gap-2 text-slate-400 text-[13px] md:text-sm">
                                <User size={12} className="text-blue-500/70" />
                                <span className="font-medium">{hadith.ravi}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-2 text-slate-500 text-[11px] md:text-xs font-semibold uppercase tracking-wider">
                            <BookOpen size={12} className="text-blue-500/70" />
                            <span>{hadith.kaynak}</span>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="px-4 py-3 md:px-6 md:py-4 border-t border-slate-800/30 flex items-center justify-between bg-slate-900/20">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleLike}
                            disabled={isLikeLoading}
                            className={cn(
                                "flex items-center gap-1.5 transition-all group/heart active:scale-90",
                                isLiked ? "text-red-500 scale-110" : "text-slate-400 hover:text-red-400"
                            )}
                        >
                            {isLikeLoading ? (
                                <Loader2 size={18} className="animate-spin text-slate-500" />
                            ) : (
                                <Heart size={18} className={cn(isLiked && "fill-current")} />
                            )}
                            <span className="text-sm font-bold tracking-tight">{likeCount}</span>
                        </button>
                        <button
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsReportModalOpen(true); }}
                            className="p-1.5 text-slate-500 hover:text-blue-500 transition-colors"
                            title="Yorum Yap"
                        >
                            <MessageSquare size={18} />
                        </button>
                        <button
                            onClick={handleShare}
                            className="p-1.5 text-slate-500 hover:text-blue-400 transition-colors"
                            title="Paylaş"
                        >
                            <Share2 size={18} />
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

            <ReportModal
                hadith={hadith}
                isOpen={isReportModalOpen}
                onClose={() => setIsReportModalOpen(false)}
            />
        </>
    );
}
