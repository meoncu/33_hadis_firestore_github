'use client';

import { useState, useEffect, useCallback } from 'react';
import { useInView } from 'react-intersection-observer';
import { hadithService } from '@/services/firestore';
import { Hadith, HadithCategory } from '@/types/hadith';
import HadithCard from '@/components/public/HadithCard';
import FilterBar from '@/components/public/FilterBar';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

import { useAuth } from '@/hooks/useAuth';

function HadithListContent() {
    const { user } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const pageFromUrl = parseInt(searchParams.get('page') || '1', 10);

    const [hadiths, setHadiths] = useState<Hadith[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [category, setCategory] = useState<HadithCategory | 'All'>('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(pageFromUrl);

    // User Read Tracking State
    const [readHadithIds, setReadHadithIds] = useState<Set<string>>(new Set());
    const [readFilter, setReadFilter] = useState<'all' | 'unread' | 'read'>('unread');
    const [activeReadingHadithId, setActiveReadingHadithId] = useState<string | null>(null);

    // Fetch user read hadiths when logged in
    useEffect(() => {
        if (user) {
            hadithService.getUserReadHadithIds(user.uid).then(ids => {
                setReadHadithIds(ids);
            });
        } else {
            setReadHadithIds(new Set());
        }
    }, [user]);

    const loadPageData = async (targetPage: number, targetCat = category) => {
        setLoading(true);
        try {
            const result = await hadithService.getPageHadiths({
                page: targetPage,
                pageSize: 20,
                category: targetCat
            });

            setHadiths(result.data || []);
            setHasMore(result.hasMore);
        } catch (error) {
            console.error('Fetch error:', error);
            setHadiths([]);
        } finally {
            setLoading(false);
        }
    };

    // URL change or category change listener
    useEffect(() => {
        const page = parseInt(searchParams.get('page') || '1', 10);
        setCurrentPage(page);
        loadPageData(page, category);
        setActiveReadingHadithId(null);
    }, [searchParams, category]);

    const changePage = (newPage: number) => {
        if (newPage < 1) return;
        setCurrentPage(newPage);
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', newPage.toString());
        router.push(`/?${params.toString()}`, { scroll: false });
        loadPageData(newPage, category);
        setActiveReadingHadithId(null);
        window.scrollTo({ top: 300, behavior: 'smooth' });
    };

    const handleMarkRead = (hadithId: string) => {
        setReadHadithIds(prev => new Set(prev).add(hadithId));
    };

    const handleToggleExpand = (hadithId: string) => {
        setActiveReadingHadithId(prev => prev === hadithId ? null : hadithId);
    };

    // Safe search & Read/Unread filter
    const filteredHadiths = (hadiths || []).filter(h => {
        const matchesSearch =
            (h.metin || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (h.ravi || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (h.kaynak || '').toLowerCase().includes(searchQuery.toLowerCase());

        if (!matchesSearch) return false;

        if (!user || readFilter === 'all') return true;

        const isCurrentlyRead = h.id
            ? (readHadithIds.has(h.id) || (h.siraNo ? readHadithIds.has(`sira_${h.siraNo}`) || readHadithIds.has(String(h.siraNo)) : false))
            : false;

        if (readFilter === 'unread') {
            // Hadis şu an aktif okunan hadis ise ekranda kalsın, başka hadise geçildiğinde okunanlara aktarılsın
            const isActiveReading = h.id === activeReadingHadithId;
            return !isCurrentlyRead || isActiveReading;
        }

        if (readFilter === 'read') return isCurrentlyRead;

        return true;
    });

    const handleResetReadHistory = async () => {
        if (!user) return;
        if (confirm('Tüm okuma geçmişinizi sıfırlamak istediğinize emin misiniz? Bütün okundu işaretleri silinecektir.')) {
            try {
                await hadithService.resetUserReadHistory(user.uid);
                setReadHadithIds(new Set());
                alert('Okuma geçmişiniz başarıyla sıfırlandı!');
            } catch (err: any) {
                alert('Sıfırlama sırasında bir hata oluştu: ' + (err.message || 'Bilinmeyen hata'));
            }
        }
    };

    return (
        <main className="min-h-screen pb-20">
            {/* Hero Section */}
            <section className="pt-8 md:pt-20 pb-6 md:pb-8 px-4 md:px-6 text-center">
                <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold mb-3 bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent tracking-tight">
                    Hadis-i Şerif Keşif Portalı
                </h1>
                <p className="text-slate-400 max-w-2xl mx-auto text-base md:text-lg leading-relaxed opacity-80 px-2 md:px-0">
                    Doğru kaynaklardan derlenmiş, ahlak ve iman ufkumuzu aydınlatan nebevi mesajlar.
                </p>
            </section>

            {/* Filters */}
            <section className="px-4 md:px-6 mb-6 md:mb-8">
                <FilterBar
                    selectedCategory={category}
                    onCategoryChange={setCategory}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    readFilter={readFilter}
                    onReadFilterChange={setReadFilter}
                    isLoggedIn={!!user}
                    totalHadithsCount={7580}
                    readCount={readHadithIds.size}
                    unreadCount={Math.max(0, 7580 - readHadithIds.size)}
                    onResetReadHistory={handleResetReadHistory}
                />
            </section>

            {/* Grid */}
            <section className="px-4 md:px-6 max-w-7xl mx-auto">
                {filteredHadiths.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-8">
                        {filteredHadiths.map((h) => {
                            const isRead = h.id
                                ? (readHadithIds.has(h.id) || (h.siraNo ? readHadithIds.has(`sira_${h.siraNo}`) || readHadithIds.has(String(h.siraNo)) : false))
                                : false;
                            return (
                                <HadithCard
                                    key={h.id}
                                    hadith={h}
                                    isReadInitially={isRead}
                                    onMarkRead={handleMarkRead}
                                    isExpandedControlled={h.id === activeReadingHadithId}
                                    onToggleExpandControlled={handleToggleExpand}
                                />
                            );
                        })}
                    </div>
                ) : !loading && (
                    readFilter === 'unread' && hadiths.length > 0 ? (
                        <div className="text-center py-16 px-4 bg-slate-900/60 border border-slate-800 rounded-2xl max-w-xl mx-auto space-y-4 shadow-xl">
                            <div className="text-4xl">🎉</div>
                            <h3 className="text-xl font-bold text-slate-100">Bu Sayfadaki Tüm Hadisleri Okudunuz!</h3>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                Sayfa {currentPage} üzerindeki hadislerin tamamı okundu olarak işaretlendi. Sonraki sayfadaki okunmayan hadislerle devam edebilirsiniz.
                            </p>
                            <button
                                onClick={() => changePage(currentPage + 1)}
                                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg transition-all active:scale-95 text-sm"
                            >
                                Sonraki Okunmayan Hadislere Geç (Sayfa {currentPage + 1}) →
                            </button>
                        </div>
                    ) : (
                        <div className="text-center py-20 text-slate-500">
                            Aradığınız kriterlere uygun hadis bulunamadı.
                        </div>
                    )
                )}

                {/* Pagination Controls */}
                <div className="mt-12 flex flex-col items-center gap-4 py-8 border-t border-slate-800/50">
                    {loading ? (
                        <div className="flex flex-col items-center gap-2">
                            <Loader2 className="animate-spin text-blue-500" size={32} />
                            <p className="text-slate-500 text-sm">Hikmetler yükleniyor...</p>
                        </div>
                    ) : (
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => changePage(currentPage - 1)}
                                disabled={currentPage === 1 || loading}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all font-semibold text-sm"
                            >
                                <ChevronLeft size={18} />
                                Önceki Sayfa
                            </button>

                            <div className="px-4 py-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold rounded-xl text-sm">
                                Sayfa {currentPage}
                            </div>

                            <button
                                onClick={() => changePage(currentPage + 1)}
                                disabled={!hasMore || loading}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all font-semibold text-sm"
                            >
                                Sonraki Sayfa
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
}

export default function HomePage() {
    return (
        <Suspense fallback={<div className="p-20 text-center text-slate-500">Yükleniyor...</div>}>
            <HadithListContent />
        </Suspense>
    );
}
