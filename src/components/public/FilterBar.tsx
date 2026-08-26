'use client';

import { HadithCategory } from '@/types/hadith';
import { cn } from '@/lib/utils';
import { Search, RotateCcw } from 'lucide-react';

const CATEGORIES: (HadithCategory | 'All')[] = ['All', 'Ahlak', 'İbadet', 'Dua', 'İman', 'Sosyal Hayat'];

interface FilterBarProps {
    selectedCategory: string;
    onCategoryChange: (category: any) => void;
    searchQuery: string;
    onSearchChange: (query: string) => void;
    readFilter?: 'all' | 'unread' | 'read';
    onReadFilterChange?: (filter: 'all' | 'unread' | 'read') => void;
    isLoggedIn?: boolean;
    totalHadithsCount?: number;
    readCount?: number;
    unreadCount?: number;
    onResetReadHistory?: () => void;
}

export default function FilterBar({
    selectedCategory,
    onCategoryChange,
    searchQuery,
    onSearchChange,
    readFilter = 'all',
    onReadFilterChange,
    isLoggedIn = false,
    totalHadithsCount = 7580,
    readCount = 0,
    unreadCount = 7580,
    onResetReadHistory
}: FilterBarProps) {
    return (
        <div className="space-y-4 md:space-y-6 w-full max-w-5xl mx-auto">
            {/* Search Input */}
            <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 md:pl-4 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 md:h-5 md:w-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input
                    type="text"
                    placeholder="Hadis, ravi veya kaynak ara..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="block w-full pl-10 md:pl-12 pr-4 py-3 md:py-4 bg-slate-900/50 border border-slate-800 rounded-xl md:rounded-2xl text-sm md:text-base text-slate-100 placeholder:text-slate-600 focus:ring-1 md:focus:ring-2 focus:ring-blue-500/50 outline-none transition-all shadow-lg backdrop-blur-sm"
                />
            </div>

            {/* Read/Unread Filter for Logged-In Users */}
            {isLoggedIn && onReadFilterChange && (
                <div className="flex flex-wrap justify-center items-center gap-2 md:gap-3">
                    <button
                        onClick={() => onReadFilterChange('all')}
                        className={cn(
                            "px-3.5 py-1.5 rounded-xl text-xs md:text-sm font-semibold transition-all border flex items-center gap-1.5 shadow-sm",
                            readFilter === 'all'
                                ? "bg-slate-800 border-slate-700 text-white ring-2 ring-slate-700/50"
                                : "bg-slate-900/40 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                        )}
                    >
                        <span>Tüm Hadisler</span>
                        <span className="px-1.5 py-0.5 rounded-md bg-slate-950/60 text-[10px] md:text-xs font-mono text-slate-400">
                            {totalHadithsCount.toLocaleString()}
                        </span>
                    </button>

                    <button
                        onClick={() => onReadFilterChange('unread')}
                        className={cn(
                            "px-3.5 py-1.5 rounded-xl text-xs md:text-sm font-semibold transition-all border flex items-center gap-1.5 shadow-sm",
                            readFilter === 'unread'
                                ? "bg-blue-900/40 border-blue-500/50 text-blue-300 ring-2 ring-blue-500/30"
                                : "bg-slate-900/40 border-slate-800 text-slate-400 hover:text-blue-300 hover:border-slate-700"
                        )}
                    >
                        <span>✨ Henüz Okumadıklarım</span>
                        <span className="px-1.5 py-0.5 rounded-md bg-blue-950/80 text-[10px] md:text-xs font-mono text-blue-400 font-bold">
                            {unreadCount.toLocaleString()}
                        </span>
                    </button>

                    <button
                        onClick={() => onReadFilterChange('read')}
                        className={cn(
                            "px-3.5 py-1.5 rounded-xl text-xs md:text-sm font-semibold transition-all border flex items-center gap-1.5 shadow-sm",
                            readFilter === 'read'
                                ? "bg-emerald-900/40 border-emerald-500/50 text-emerald-300 ring-2 ring-emerald-500/30"
                                : "bg-slate-900/40 border-slate-800 text-slate-400 hover:text-emerald-300 hover:border-slate-700"
                        )}
                    >
                        <span>✓ Okuduklarım</span>
                        <span className="px-1.5 py-0.5 rounded-md bg-emerald-950/80 text-[10px] md:text-xs font-mono text-emerald-400 font-bold">
                            {readCount.toLocaleString()}
                        </span>
                    </button>

                    {onResetReadHistory && (
                        <button
                            onClick={onResetReadHistory}
                            className="px-3 py-1.5 rounded-xl text-xs md:text-sm font-semibold transition-all border bg-red-950/20 border-red-800/40 text-red-400 hover:bg-red-900/40 hover:text-red-300 flex items-center gap-1.5 shadow-sm ml-1"
                            title="Okuma geçmişinizi sıfırlayın"
                        >
                            <RotateCcw size={14} />
                            <span>Sıfırla</span>
                        </button>
                    )}
                </div>
            )}

            {/* Category Pills */}
            <div className="flex overflow-x-auto pb-2 -mx-6 px-6 md:mx-0 md:px-0 scrollbar-hide gap-2 justify-start md:justify-center">
                {CATEGORIES.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => onCategoryChange(cat)}
                        className={cn(
                            "px-4 md:px-5 py-1.5 md:py-2 whitespace-nowrap rounded-full text-xs md:text-sm font-semibold transition-all border",
                            selectedCategory === cat
                                ? "bg-blue-600 border-blue-500 text-white shadow-xl"
                                : "bg-slate-900/40 border-slate-800 text-slate-500 hover:border-slate-700 hover:text-slate-300"
                        )}
                    >
                        {cat === 'All' ? 'Tümü' : cat}
                    </button>
                ))}
            </div>
        </div>
    );
}
