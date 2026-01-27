'use client';

import Link from 'next/link';
import { Book, LayoutDashboard, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    const navLinks = [
        { name: 'Koleksiyonlar', href: '/' },
        { name: 'Ravi Portreleri', href: '#' },
        { name: 'Hakkımızda', href: '#' },
    ];

    return (
        <nav className="nav-blur">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="bg-blue-600 p-2 rounded-xl group-hover:rotate-12 transition-transform shadow-lg shadow-blue-500/20">
                        <Book className="text-white" size={24} />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-white">HikmetPınarı</span>
                </Link>

                {/* Desktop Links */}
                <div className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className={cn(
                                "text-sm font-medium transition-colors hover:text-blue-400",
                                pathname === link.href ? "text-blue-400" : "text-slate-400"
                            )}
                        >
                            {link.name}
                        </Link>
                    ))}
                    <div className="h-6 w-px bg-slate-800" />
                    <Link href="/admin/dashboard" className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
                        <LayoutDashboard size={18} />
                        Yönetim
                    </Link>
                </div>

                {/* Mobile Menu Button */}
                <button className="md:hidden text-slate-400" onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ? <X size={28} /> : <Menu size={28} />}
                </button>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden bg-slate-900 border-b border-slate-800 p-6 space-y-4">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className="block text-lg text-slate-300"
                            onClick={() => setIsOpen(false)}
                        >
                            {link.name}
                        </Link>
                    ))}
                    <Link
                        href="/admin/dashboard"
                        className="block text-lg text-blue-400 font-medium pt-4 border-t border-slate-800"
                        onClick={() => setIsOpen(false)}
                    >
                        Yönetim Paneli
                    </Link>
                </div>
            )}
        </nav>
    );
}
