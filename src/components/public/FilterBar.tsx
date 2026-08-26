'use client';

import { HadithCategory } from '@/types/hadith';
import { cn } from '@/lib/utils';
import { Search } from 'lucide-react';

const CATEGORIES: (HadithCategory | 'All')[] = ['All', 'Ahlak', 'İbadet', 'Dua', 'İman', 'Sosyal Hayat'];

interface FilterBarProps {
    selectedCategory: string;
    onCategoryChange: (category: any) => void;
    searchQuery: string;
    onSearchChange: (query: string) => void;
}

export default function FilterBar({
    selectedCategory,
    onCategoryChange,
    searchQuery,
    onSearchChange
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
