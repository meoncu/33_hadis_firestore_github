'use client';

import { useState, useEffect, useCallback } from 'react';
import { useInView } from 'react-intersection-observer';
import { hadithService } from '@/services/firestore';
import { Hadith, HadithCategory } from '@/types/hadith';
import HadithCard from '@/components/public/HadithCard';
import FilterBar from '@/components/public/FilterBar';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { QueryDocumentSnapshot } from 'firebase/firestore';

export default function HomePage() {
    const [hadiths, setHadiths] = useState<Hadith[]>([]);
    const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot | undefined>(undefined);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [category, setCategory] = useState<HadithCategory | 'All'>('All');
    const [searchQuery, setSearchQuery] = useState('');

    const { ref, inView } = useInView();

    const [currentPage, setCurrentPage] = useState(1);
    const [docHistory, setDocHistory] = useState<(QueryDocumentSnapshot | undefined)[]>([undefined]);

    const fetchHadiths = useCallback(async (isInitial = false, pageIndex = 1) => {
        if (loading) return;

        setLoading(true);
        try {
            const targetLastDoc = isInitial ? undefined : docHistory[pageIndex - 1];

            const result = await hadithService.getHadiths({
                category,
                lastDoc: targetLastDoc,
                pageSize: 20
            });

            setHadiths(result.data);
            setLastDoc(result.lastDoc);
            setHasMore(result.data.length === 20);

            // Sayfa geçmişi takibi (Önceki sayfalara hızlı dönebilmek için)
            if (result.lastDoc) {
                setDocHistory(prev => {
                    const next = [...prev];
                    next[pageIndex] = result.lastDoc;
                    return next;
                });
            }
        } catch (error) {
            console.error('Fetch error:', error);
        } finally {
            setLoading(false);
        }
    }, [category, docHistory, loading]);

    // Initial fetch / category change
    useEffect(() => {
        setCurrentPage(1);
        setDocHistory([undefined]);
        fetchHadiths(true, 1);
    }, [category]);

    // Load more when scrolling
    useEffect(() => {
        if (inView && hasMore && !loading) {
            fetchHadiths();
        }
    }, [inView, hasMore, loading, fetchHadiths]);

    // Filter by search query (client-side simple filter for now)
    const filteredHadiths = hadiths.filter(h =>
        h.metin.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.ravi?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.kaynak.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
                />
            </section>

            {/* Grid */}
            <section className="px-4 md:px-6 max-w-7xl mx-auto">
                {filteredHadiths.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-8">
                        {filteredHadiths.map((h) => (
                            <HadithCard key={h.id} hadith={h} />
                        ))}
                    </div>
                ) : !loading && (
                    <div className="text-center py-20 text-slate-500">
                        Aradığınız kriterlere uygun hadis bulunamadı.
                    </div>
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
                                onClick={() => {
                                    if (currentPage > 1) {
                                        const prevPage = currentPage - 1;
                                        setCurrentPage(prevPage);
                                        fetchHadiths(false, prevPage);
                                        window.scrollTo({ top: 300, behavior: 'smooth' });
                                    }
                                }}
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
                                onClick={() => {
                                    if (hasMore) {
                                        const nextPage = currentPage + 1;
                                        setCurrentPage(nextPage);
                                        fetchHadiths(false, nextPage);
                                        window.scrollTo({ top: 300, behavior: 'smooth' });
                                    }
                                }}
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
