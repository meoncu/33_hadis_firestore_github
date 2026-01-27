'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Hadith, HadithCategory } from '@/types/hadith';
import { Loader2, Save, X } from 'lucide-react';

const CATEGORIES: HadithCategory[] = ['Ahlak', 'İbadet', 'Dua', 'İman', 'Sosyal Hayat', 'Diğer'];

const schema = z.object({
    metin: z.string().min(10, 'Hadis metni en az 10 karakter olmalıdır'),
    ravi: z.string().optional(),
    kaynak: z.string().min(2, 'Kaynak belirtilmelidir'),
    kategori: z.enum(['Ahlak', 'İbadet', 'Dua', 'İman', 'Sosyal Hayat', 'Diğer']),
    yayinDurumu: z.enum(['draft', 'published']),
    dil: z.enum(['TR', 'EN']),
});

interface HadithFormProps {
    initialData?: Hadith;
    onSubmit: (data: any) => Promise<void>;
    onCancel: () => void;
    isLoading?: boolean;
}

export default function HadithForm({ initialData, onSubmit, onCancel, isLoading }: HadithFormProps) {
    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(schema),
        defaultValues: initialData || {
            metin: '',
            ravi: '',
            kaynak: '',
            kategori: 'Ahlak',
            yayinDurumu: 'draft',
            dil: 'TR',
        },
    });

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">
                    {initialData ? 'Hadisi Düzenle' : 'Yeni Hadis Ekle'}
                </h2>
                <button onClick={onCancel} className="text-slate-500 hover:text-slate-300">
                    <X size={24} />
                </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Hadis Metni</label>
                    <textarea
                        {...register('metin')}
                        rows={4}
                        className="w-full admin-input resize-none"
                        placeholder="Peygamber Efendimiz (sav) buyurdu ki..."
                    />
                    {errors.metin && <p className="mt-1 text-xs text-red-400">{errors.metin.message}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Ravi (Opsiyonel)</label>
                        <input {...register('ravi')} className="w-full admin-input" placeholder="Örn: Ebu Hureyre" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Kaynak</label>
                        <input {...register('kaynak')} className="w-full admin-input" placeholder="Örn: Buhari, Edeb 1" />
                        {errors.kaynak && <p className="mt-1 text-xs text-red-400">{errors.kaynak.message}</p>}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Kategori</label>
                        <select {...register('kategori')} className="w-full admin-input">
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Yayın Durumu</label>
                        <select {...register('yayinDurumu')} className="w-full admin-input">
                            <option value="draft">Taslak</option>
                            <option value="published">Yayında</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Dil</label>
                        <select {...register('dil')} className="w-full admin-input">
                            <option value="TR">Türkçe</option>
                            <option value="EN">English</option>
                        </select>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-6 py-2.5 rounded-xl border border-slate-700 text-slate-400 hover:bg-slate-800 transition-all font-medium"
                    >
                        Vazgeç
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="btn-primary min-w-[120px]"
                    >
                        {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                        {initialData ? 'Güncelle' : 'Kaydet'}
                    </button>
                </div>
            </form>
        </div>
    );
}
