'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Hadith, HadithCategory } from '@/types/hadith';
import { Loader2, Save, X, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';

const CATEGORIES: HadithCategory[] = ['Ahlak', 'İbadet', 'Dua', 'İman', 'Sosyal Hayat', 'Diğer'];

const schema = z.object({
    metin: z.string().min(10, 'Hadis metni en az 10 karakter olmalıdır'),
    ravi: z.string().optional(),
    kaynak: z.string().min(2, 'Kaynak belirtilmelidir'),
    kategori: z.enum(['Ahlak', 'İbadet', 'Dua', 'İman', 'Sosyal Hayat', 'Diğer']),
    yayinDurumu: z.enum(['draft', 'published']),
    dil: z.enum(['TR', 'EN']),
    siraNo: z.string().transform((val) => val === '' ? undefined : Number(val)).optional(),
    resimUrl: z.string().url('Geçerli bir URL girmelisiniz').or(z.literal('')).optional(),
});

interface HadithFormProps {
    initialData?: Hadith;
    onSubmit: (data: any) => Promise<void>;
    onCancel: () => void;
    isLoading?: boolean;
}

export default function HadithForm({ initialData, onSubmit, onCancel, isLoading }: HadithFormProps) {
    const { register, handleSubmit, watch, formState: { errors } } = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            metin: initialData?.metin || '',
            ravi: initialData?.ravi || '',
            kaynak: initialData?.kaynak || '',
            kategori: initialData?.kategori || 'Ahlak',
            yayinDurumu: initialData?.yayinDurumu || 'draft',
            dil: initialData?.dil || 'TR',
            siraNo: initialData?.siraNo?.toString() || '',
            resimUrl: initialData?.resimUrl || '',
        },
    });

    const watchedResimUrl = watch('resimUrl');

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white font-outfit">
                    {initialData ? 'Hadisi Düzenle' : 'Yeni Hadis Ekle'}
                </h2>
                <button onClick={onCancel} className="text-slate-500 hover:text-slate-300 transition-colors">
                    <X size={24} />
                </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Image URL Input & Preview */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Resim URL (Dış Bağlantı)</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                                <LinkIcon size={18} />
                            </div>
                            <input
                                {...register('resimUrl')}
                                className="w-full admin-input pl-10"
                                placeholder="https://example.com/resim.jpg"
                            />
                        </div>
                        {errors.resimUrl && <p className="mt-1 text-xs text-red-400">{errors.resimUrl.message}</p>}
                    </div>

                    {watchedResimUrl && (
                        <div className="border-2 border-slate-800 rounded-xl p-2 bg-slate-900/50 flex flex-col items-center">
                            <span className="text-[10px] uppercase tracking-widest text-slate-500 mb-2">Önizleme</span>
                            <img
                                src={watchedResimUrl}
                                alt="Önizleme"
                                className="max-h-[150px] object-contain rounded-lg shadow-xl"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x150?text=Gecersiz+URL';
                                }}
                            />
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-1">
                        <label className="block text-sm font-medium text-slate-400 mb-2">Sıra No</label>
                        <input
                            {...register('siraNo')}
                            type="number"
                            className="w-full admin-input"
                            placeholder="Örn: 1"
                        />
                    </div>
                    <div className="md:col-span-3">
                        <label className="block text-sm font-medium text-slate-400 mb-2">Ravi (Opsiyonel)</label>
                        <input {...register('ravi')} className="w-full admin-input" placeholder="Örn: Ebu Hureyre" />
                    </div>
                </div>

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
                        <label className="block text-sm font-medium text-slate-400 mb-2">Kaynak</label>
                        <input {...register('kaynak')} className="w-full admin-input" placeholder="Örn: Buhari, Edeb 1" />
                        {errors.kaynak && <p className="mt-1 text-xs text-red-400">{errors.kaynak.message}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Kategori</label>
                        <select {...register('kategori')} className="w-full admin-input">
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
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
                        className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-2.5 rounded-xl transition-all font-semibold flex items-center gap-2 shadow-lg shadow-blue-600/20 active:scale-95 disabled:opacity-50 disabled:active:scale-100"
                    >
                        {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                        {initialData ? 'Güncelle' : 'Kaydet'}
                    </button>
                </div>
            </form>
        </div>
    );
}
