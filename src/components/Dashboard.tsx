import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { motion } from 'framer-motion';
import {
    FileText,
    Hash,
    Folder,
    Star,
    ChevronDown,
    Clock
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { MindMapView } from './MindMapView';
import { useState } from 'react';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const Dashboard: React.FC = () => {
    const { themes, categories, notes, setSelectedNote } = useAppStore();
    const [isRecentCollapsed, setIsRecentCollapsed] = useState(false);

    const stats = [
        { label: 'Temas', value: themes.length, icon: Folder, color: 'text-violet-400', bg: 'bg-violet-500/10' },
        { label: 'Categorías', value: categories.length, icon: Hash, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
        { label: 'Notas Totales', value: notes.length, icon: FileText, color: 'text-blue-400', bg: 'bg-blue-500/10' },
        { label: 'Favoritos', value: themes.filter(t => t.isFavorite).length, icon: Star, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    ];

    const recentNotes = [...notes]
        .sort((a, b) => b.updatedAt - a.updatedAt)
        .slice(0, 10);

    return (
        <div className="flex-1 relative bg-[#0c0c0e] overflow-hidden">
            {/* Background Mind Map View - The centerpiece */}
            <div className="absolute inset-0 z-0">
                <MindMapView />
            </div>

            {/* Overlaid UI - Top Stats Area */}
            <div className="absolute top-0 left-0 right-0 p-8 z-10 pointer-events-none">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-8">
                    {/* Brand Info */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="flex items-center gap-4 mb-2">
                            <h1 className="text-xl lg:text-2xl xl:text-4xl font-black text-white tracking-tight">Tu Mapa Mental</h1>
                        </div>
                        <p className="text-zinc-500 text-lg">Tu universo de ideas expandido.</p>
                    </motion.div>

                    {/* Stats HUD (Heads-up Display) */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pointer-events-auto">
                        {stats.map((stat, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.1 }}
                                className="px-5 py-3 rounded-2xl bg-[#141417]/80 backdrop-blur-xl border border-white/5 flex flex-col items-center justify-center shadow-2xl"
                            >
                                <div className="text-xl font-black text-white">{stat.value}</div>
                                <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-[0.15em]">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Overlaid UI - Right Sidebar (Recent Activity) */}
            <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{
                    opacity: 1,
                    x: 0,
                    height: isRecentCollapsed ? '56px' : 'calc(100vh - 160px)'
                }}
                className="absolute top-32 right-8 w-72 z-10 pointer-events-auto overflow-hidden transition-all duration-300 ease-in-out"
            >
                <div className="h-full rounded-3xl bg-[#141417]/70 backdrop-blur-2xl border border-white/5 shadow-2xl flex flex-col">
                    <div
                        className="px-6 py-4 border-b border-white/5 flex items-center justify-between cursor-pointer hover:bg-white/[0.02] transition-colors"
                        onClick={() => setIsRecentCollapsed(!isRecentCollapsed)}
                    >
                        <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2 text-nowrap">
                            <Clock className="w-4 h-4 text-violet-400" />
                            Recientes
                        </h2>
                        <motion.button
                            animate={{ rotate: isRecentCollapsed ? 180 : 0 }}
                            className="p-1 hover:bg-white/5 rounded-lg transition-colors"
                        >
                            <ChevronDown className="w-4 h-4 text-zinc-400" />
                        </motion.button>
                    </div>

                    <div className={cn(
                        "flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar transition-opacity duration-300",
                        isRecentCollapsed ? "opacity-0 pointer-events-none" : "opacity-100"
                    )}>
                        {recentNotes.map((note) => (
                            <motion.div
                                key={note.id}
                                whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.03)' }}
                                onClick={() => setSelectedNote(note.id)}
                                className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 group cursor-pointer transition-all"
                            >
                                <h3 className="text-xs font-bold text-zinc-300 mb-1 group-hover:text-violet-400 transition-colors truncate">
                                    {note.title || 'Sin título'}
                                </h3>
                                <div className="flex items-center justify-between text-[9px] text-zinc-600 font-medium">
                                    <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
                                    <span className="truncate max-w-[80px]">
                                        {categories.find(c => c.id === note.categoryId)?.name || 'Sueltas'}
                                    </span>
                                </div>
                            </motion.div>
                        ))}

                        {notes.length === 0 && (
                            <div className="text-center py-12">
                                <FileText className="w-8 h-8 text-zinc-800 mx-auto mb-3" />
                                <p className="text-xs text-zinc-600 italic">No hay actividad aún</p>
                            </div>
                        )}
                    </div>

                    {!isRecentCollapsed && (
                        <div className="p-4 bg-violet-600/5 rounded-b-3xl">
                            <div className="flex justify-between items-center px-2">
                                <span className="text-[9px] text-violet-300 font-bold uppercase">Actividad Mapa</span>
                                <div className="flex gap-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
                                    <div className="w-1.5 h-1.5 rounded-full bg-violet-500/50" />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Subtle Gradient Shadow (Bottom) */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0c0c0e] to-transparent pointer-events-none z-0" />
        </div>
    );
};
