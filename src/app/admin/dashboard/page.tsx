'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { hadithService } from '@/services/firestore';
import { Hadith } from '@/types/hadith';
import HadithForm from '@/components/admin/HadithForm';
import {
    Plus,
    Edit2,
    Trash2,
    LogOut,
    Search,
    CheckCircle2,
    Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AdminDashboard() {
    const { user, loading: authLoading, logout } = useAuth();
    const [hadiths, setHadiths] = useState<Hadith[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingHadith, setEditingHadith] = useState<Hadith | null>(null);

    const fetchAll = async () => {
        setLoading(true);
        try {
            // In a real app, you'd want pagination here too
            const result = await hadithService.getHadiths({ pageSize: 50 });
            setHadiths(result.data);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchAll();
    }, [user]);

    if (authLoading) return <div className="p-20 text-center">Yükleniyor...</div>;
    if (!user) return <div className="p-20 text-center text-red-500">Yetkisiz Erişim! Lütfen giriş yapın.</div>;

    const handleSubmit = async (data: any) => {
        setLoading(true);
        try {
            if (editingHadith) {
                await hadithService.updateHadith(editingHadith.id!, data);
            } else {
                await hadithService.addHadith(data);
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

    const handleDelete = async (id: string) => {
        if (confirm('Bu hadisi silmek istediğinize emin misiniz?')) {
            await hadithService.deleteHadith(id);
            fetchAll();
        }
    };

    return (
        <div className="min-h-screen bg-[#050a14] p-6 lg:p-12">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Hadis Yönetim Paneli</h1>
                        <p className="text-slate-500">Hoş geldin, {user.email}</p>
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={() => { setEditingHadith(null); setIsFormOpen(true); }}
                            className="btn-primary"
                        >
                            <Plus size={20} />
                            Yeni Ekle
                        </button>
                        <button
                            onClick={logout}
                            className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700 transition-colors"
                        >
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>

                {/* Form Modal */}
                {isFormOpen && (
                    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6">
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
                <div className="glass-card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-slate-800 bg-slate-900/40 text-slate-400 text-sm uppercase tracking-wider">
                                    <th className="px-6 py-4 font-semibold">Hadis Metni</th>
                                    <th className="px-6 py-4 font-semibold">Kategori</th>
                                    <th className="px-6 py-4 font-semibold">Durum</th>
                                    <th className="px-6 py-4 font-semibold text-right">İşlemler</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                                {hadiths.map((h) => (
                                    <tr key={h.id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-6 py-4">
                                            <p className="text-slate-200 line-clamp-2 text-sm max-w-md italic">"{h.metin}"</p>
                                            <span className="text-slate-500 text-xs mt-1 block">{h.kaynak}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-medium text-slate-400 bg-slate-800 px-2 py-1 rounded">
                                                {h.kategori}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {h.yayinDurumu === 'published' ? (
                                                <span className="flex items-center gap-1.5 text-emerald-400 text-xs">
                                                    <CheckCircle2 size={14} /> Yayında
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1.5 text-orange-400 text-xs">
                                                    <Clock size={14} /> Taslak
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => { setEditingHadith(h); setIsFormOpen(true); }}
                                                    className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(h.id!)}
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
                        <div className="py-20 text-center text-slate-500">Henüz hiç hadis eklenmemiş.</div>
                    )}
                </div>
            </div>
        </div>
    );
}
