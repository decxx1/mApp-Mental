import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { motion, AnimatePresence } from 'framer-motion';
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
    const { themes, categories, notes, setSelectedNote, isDashboardUiVisible } = useAppStore();
    const [isRecentCollapsed, setIsRecentCollapsed] = useState(true);

    const stats = [
        { label: 'Temas', value: themes.length, icon: Folder, color: 'text-violet-400', bg: 'bg-violet-500/10' },
        { label: 'Categorías', value: categories.length, icon: Hash, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
        { label: 'Notas', value: notes.length, icon: FileText, color: 'text-blue-400', bg: 'bg-blue-500/10' },
        { label: 'Favoritos', value: themes.filter(t => t.isFavorite).length, icon: Star, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    ];

    const recentNotes = [...notes]
        .sort((a, b) => b.updatedAt - a.updatedAt)
        .slice(0, 10);

    return (
        <div className="flex-1 relative bg-background overflow-hidden">
            {/* Background Mind Map View - The centerpiece */}
            <div className="absolute inset-0 z-0">
                <MindMapView />
            </div>

            {/* Overlaid UI - Top Stats Area */}
            <AnimatePresence>
                {isDashboardUiVisible && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="absolute top-0 left-0 right-0 p-8 z-10 pointer-events-none"
                    >
                        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-8">
                            {/* Brand Info */}
                            <div>
                                <div className="flex items-center gap-4 mb-2">
                                    <h1 className="text-xl lg:text-2xl xl:text-4xl font-black text-white tracking-tight">Tu Mapa Mental</h1>
                                </div>
                                <p className="text-zinc-500 text-lg">Tu universo de ideas expandido.</p>
                            </div>

                            {/* stat HUD */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pointer-events-auto">
                                {stats.map((stat, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="px-2 py-2 rounded-2xl bg-surface/80 backdrop-blur-xl border border-white/5 flex flex-col items-center justify-center shadow-2xl"
                                    >
                                        <div className="text-lg font-bold text-white">{stat.value}</div>
                                        <div className="text-[9px] text-zinc-500 font-medium uppercase tracking-wide">{stat.label}</div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Overlaid UI - Right Sidebar (Recent Activity) */}
            <AnimatePresence>
                {isDashboardUiVisible && (
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{
                            opacity: 1,
                            x: 0,
                            height: isRecentCollapsed ? '56px' : 'calc(100vh - 160px)'
                        }}
                        exit={{ opacity: 0, x: 50 }}
                        className="absolute top-32 right-8 w-72 z-10 pointer-events-auto overflow-hidden transition-opacity duration-300 ease-in-out"
                    >
                        <div className="h-full rounded-3xl bg-surface/70 backdrop-blur-2xl border border-white/5 shadow-2xl flex flex-col">
                            <div
                                className="px-6 py-4 border-b border-white/5 flex items-center justify-between cursor-pointer hover:bg-white/2 rounded-3xl transition-colors"
                                onClick={() => setIsRecentCollapsed(!isRecentCollapsed)}
                            >
                                <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2 text-nowrap">
                                    <Clock className="w-4 h-4 text-primary-light" />
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
                                        className="p-4 rounded-2xl bg-white/2 border border-white/5 group cursor-pointer transition-all"
                                    >
                                        <h3 className="text-xs font-bold text-zinc-300 mb-1 group-hover:text-primary-light transition-colors truncate">
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
                                <div className="p-4 bg-primary/5 rounded-b-3xl">
                                    <div className="flex justify-between items-center px-2">
                                        <span className="text-[9px] text-primary-light font-bold uppercase">Actividad Mapa</span>
                                        <div className="flex gap-1">
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary/50" />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Subtle Gradient Shadow (Bottom) */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-background to-transparent pointer-events-none z-0" />
        </div>
    );
};
