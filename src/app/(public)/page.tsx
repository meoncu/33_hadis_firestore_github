'use client';

import { useState, useEffect, useCallback } from 'react';
import { useInView } from 'react-intersection-observer';
import { hadithService } from '@/services/firestore';
import { Hadith, HadithCategory } from '@/types/hadith';
import HadithCard from '@/components/public/HadithCard';
import FilterBar from '@/components/public/FilterBar';
import { Loader2 } from 'lucide-react';
import { QueryDocumentSnapshot } from 'firebase/firestore';

export default function HomePage() {
    const [hadiths, setHadiths] = useState<Hadith[]>([]);
    const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot | undefined>(undefined);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [category, setCategory] = useState<HadithCategory | 'All'>('All');
    const [searchQuery, setSearchQuery] = useState('');

    const { ref, inView } = useInView();

    const fetchHadiths = useCallback(async (isInitial = false) => {
        if (loading || (!isInitial && !hasMore)) return;

        setLoading(true);
        try {
            const result = await hadithService.getHadiths({
                category,
                lastDoc: isInitial ? undefined : lastDoc,
                pageSize: 12
            });

            if (isInitial) {
                setHadiths(result.data);
            } else {
                setHadiths(prev => [...prev, ...result.data]);
            }

            setLastDoc(result.lastDoc);
            setHasMore(result.data.length === 12);
        } catch (error) {
            console.error('Fetch error:', error);
        } finally {
            setLoading(false);
        }
    }, [category, lastDoc, loading, hasMore]);

    // Initial fetch / category change
    useEffect(() => {
        fetchHadiths(true);
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
            <section className="pt-20 pb-12 px-6 text-center">
                <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                    Hadis-i Şerif Keşif Portalı
                </h1>
                <p className="text-slate-400 max-w-2xl mx-auto text-lg">
                    Doğru kaynaklardan derlenmiş, ahlak ve iman ufkumuzu aydınlatan nebevi mesajlar.
                </p>
            </section>

            {/* Filters */}
            <section className="px-6 mb-12">
                <FilterBar
                    selectedCategory={category}
                    onCategoryChange={setCategory}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                />
            </section>

            {/* Grid */}
            <section className="px-6 max-w-7xl mx-auto">
                {filteredHadiths.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredHadiths.map((h) => (
                            <HadithCard key={h.id} hadith={h} />
                        ))}
                    </div>
                ) : !loading && (
                    <div className="text-center py-20 text-slate-500">
                        Aradığınız kriterlere uygun hadis bulunamadı.
                    </div>
                )}

                {/* Loading Spinner / Intersection Trigger */}
                <div ref={ref} className="mt-12 flex justify-center py-8">
                    {loading && (
                        <div className="flex flex-col items-center gap-2">
                            <Loader2 className="animate-spin text-blue-500" size={32} />
                            <p className="text-slate-500 text-sm">Hikmetler yükleniyor...</p>
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
}
