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
        <div className="space-y-6 w-full max-w-5xl mx-auto">
            {/* Search Input */}
            <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input
                    type="text"
                    placeholder="Anahtar kelime, ravi veya kitap ara..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="block w-full pl-12 pr-4 py-4 bg-slate-900 border border-slate-800 rounded-2xl text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all shadow-xl"
                />
            </div>

            {/* Category Pills */}
            <div className="flex flex-wrap gap-2 justify-center">
                {CATEGORIES.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => onCategoryChange(cat)}
                        className={cn(
                            "px-5 py-2 rounded-full text-sm font-medium transition-all border",
                            selectedCategory === cat
                                ? "bg-blue-600 border-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                                : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                        )}
                    >
                        {cat === 'All' ? 'Tümü' : cat}
                    </button>
                ))}
            </div>
        </div>
    );
}
