'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { hadithService } from '@/services/firestore';
import { storageService } from '@/services/storage';
import { Hadith } from '@/types/hadith';
import HadithForm from '@/components/admin/HadithForm';
import {
    Plus,
    Edit2,
    Trash2,
    LogOut,
    CheckCircle2,
    Clock,
    ImageIcon
} from 'lucide-react';

export default function AdminDashboard() {
    const { user, loading: authLoading, logout } = useAuth();
    const [hadiths, setHadiths] = useState<Hadith[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingHadith, setEditingHadith] = useState<Hadith | null>(null);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const result = await hadithService.getHadiths({ pageSize: 100, includeDrafts: true });
            // Sort by siraNo primarily
            const sortedData = result.data.sort((a, b) => {
                const siraA = a.siraNo || Number.MAX_SAFE_INTEGER;
                const siraB = b.siraNo || Number.MAX_SAFE_INTEGER;
                return siraA - siraB;
            });
            setHadiths(sortedData);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchAll();
    }, [user]);

    if (authLoading) return <div className="p-20 text-center text-slate-400">Yükleniyor...</div>;
    if (!user) return <div className="p-20 text-center text-red-500">Yetkisiz Erişim! Lütfen giriş yapın.</div>;

    const handleSubmit = async (data: any, imageFile?: File | null) => {
        setLoading(true);
        try {
            let finalData = { ...data };

            // Handle image upload if a new file is selected
            if (imageFile) {
                const imageUrl = await storageService.uploadHadithImage(imageFile);
                finalData.resimUrl = imageUrl;
                finalData.resimDurumu = 'ready';
            }

            if (editingHadith) {
                await hadithService.updateHadith(editingHadith.id!, finalData);
            } else {
                await hadithService.addHadith(finalData);
            }

            setIsFormOpen(false);
            setEditingHadith(null);
            await fetchAll();
        } catch (error: any) {
            console.error('Save error:', error);
            alert(`Kaydetme hatası: ${error.message || 'Bilinmeyen hata'}`);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (hadith: Hadith) => {
        if (confirm('Bu hadisi silmek istediğinize emin misiniz?')) {
            try {
                if (hadith.resimUrl) {
                    await storageService.deleteImage(hadith.resimUrl);
                }
                await hadithService.deleteHadith(hadith.id!);
                await fetchAll();
            } catch (error) {
                console.error('Delete error:', error);
            }
        }
    };

    return (
        <div className="min-h-screen bg-[#050a14] p-6 lg:p-12">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2 font-outfit">Hadis Yönetim Paneli</h1>
                        <p className="text-slate-500">Hoş geldin, <span className="text-blue-400 font-medium">{user.email}</span></p>
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={() => { setEditingHadith(null); setIsFormOpen(true); }}
                            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl transition-all font-semibold flex items-center gap-2 shadow-lg shadow-blue-600/20 active:scale-95"
                        >
                            <Plus size={20} />
                            Yeni Ekle
                        </button>
                        <button
                            onClick={logout}
                            className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700 transition-colors border border-slate-700"
                        >
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>

                {/* Form Modal */}
                {isFormOpen && (
                    <div className="fixed inset-0 z-[100] bg-[#050a14]/90 backdrop-blur-md flex items-center justify-center p-6">
                        <div className="w-full max-w-2xl">
                            <HadithForm
                                initialData={editingHadith || undefined}
                                onSubmit={handleSubmit}
                                onCancel={() => { setIsFormOpen(false); setEditingHadith(null); }}
                                isLoading={loading}
                            />
                        </div>
                    </div>
                )}

                {/* Table/List */}
                <div className="glass-card overflow-hidden border border-slate-800/50 shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-slate-800 bg-slate-900/40 text-slate-400 text-xs uppercase tracking-widest">
                                    <th className="px-6 py-4 font-semibold">NO</th>
                                    <th className="px-6 py-4 font-semibold">GÖRSEL</th>
                                    <th className="px-6 py-4 font-semibold">HADİS METNİ</th>
                                    <th className="px-6 py-4 font-semibold">KATEGORİ</th>
                                    <th className="px-6 py-4 font-semibold">DURUM</th>
                                    <th className="px-6 py-4 font-semibold text-right">İŞLEMLER</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                                {hadiths.map((h) => (
                                    <tr key={h.id} className="hover:bg-blue-500/[0.03] transition-colors group">
                                        <td className="px-6 py-4">
                                            <span className="text-blue-400 font-bold font-outfit">#{h.siraNo || '-'}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {h.resimUrl ? (
                                                <div className="w-12 h-12 rounded-lg overflow-hidden border border-slate-700">
                                                    <img src={h.resimUrl} alt="" className="w-full h-full object-cover" />
                                                </div>
                                            ) : (
                                                <div className="w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center text-slate-600 border border-slate-700">
                                                    <ImageIcon size={20} />
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-slate-200 line-clamp-2 text-sm max-w-md">"{h.metin}"</p>
                                            <span className="text-slate-500 text-xs mt-1 block">{h.kaynak}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-800/80 border border-slate-700 px-2 py-1 rounded-md">
                                                {h.kategori}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {h.yayinDurumu === 'published' ? (
                                                <span className="flex items-center gap-1.5 text-emerald-400 text-xs font-medium">
                                                    <CheckCircle2 size={14} /> Yayında
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1.5 text-amber-400 text-xs font-medium">
                                                    <Clock size={14} /> Taslak
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-1">
                                                <button
                                                    onClick={() => { setEditingHadith(h); setIsFormOpen(true); }}
                                                    className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(h)}
                                                    className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {hadiths.length === 0 && !loading && (
                        <div className="py-24 text-center">
                            <div className="inline-flex p-4 rounded-full bg-slate-900 border border-slate-800 text-slate-600 mb-4">
                                <Search size={32} />
                            </div>
                            <p className="text-slate-500">Henüz hiç hadis eklenmemiş. Yeni bir tane ekleyerek başlayın.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
