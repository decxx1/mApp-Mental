import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { motion } from 'framer-motion';
import {
    Brain,
    FileText,
    Hash,
    Folder,
    Star,
    Calendar,
    TrendingUp,
    Clock,
    Zap
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const Dashboard: React.FC = () => {
    const { themes, categories, notes } = useAppStore();

    const stats = [
        { label: 'Temas', value: themes.length, icon: Folder, color: 'text-violet-400', bg: 'bg-violet-500/10' },
        { label: 'Categorías', value: categories.length, icon: Hash, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
        { label: 'Notas Totales', value: notes.length, icon: FileText, color: 'text-blue-400', bg: 'bg-blue-500/10' },
        { label: 'Favoritos', value: themes.filter(t => t.isFavorite).length, icon: Star, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    ];

    const recentNotes = [...notes]
        .sort((a, b) => b.updatedAt - a.updatedAt)
        .slice(0, 5);

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <div className="flex-1 overflow-y-auto bg-[#0c0c0e] custom-scrollbar">
            <div className="max-w-6xl mx-auto py-12 px-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="mb-12"
                >
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-12 h-12 bg-violet-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-violet-600/40">
                            <Brain className="w-7 h-7 text-white" />
                        </div>
                        <h1 className="text-4xl font-black text-white tracking-tight">Tu Mapa Mental</h1>
                    </div>
                    <p className="text-zinc-500 text-lg">Visualiza y organiza tus pensamientos de un vistazo.</p>
                </motion.div>

                {/* Grid Stats */}
                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
                >
                    {stats.map((stat, i) => (
                        <motion.div
                            key={i}
                            variants={item}
                            className="p-6 rounded-3xl bg-[#141417] border border-[#26262b] hover:border-violet-500/30 transition-all group"
                        >
                            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 duration-300", stat.bg)}>
                                <stat.icon className={cn("w-6 h-6", stat.color)} />
                            </div>
                            <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                            <div className="text-zinc-500 text-sm font-medium uppercase tracking-wider">{stat.label}</div>
                        </motion.div>
                    ))}
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left & Center: Mental Structure Visual */}
                    <motion.div
                        variants={item}
                        initial="hidden"
                        animate="show"
                        className="lg:col-span-2 space-y-6"
                    >
                        <div className="p-8 rounded-3xl bg-[#141417] border border-[#26262b] relative overflow-hidden min-h-[400px]">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/5 blur-[100px] rounded-full -mr-32 -mt-32 pointer-events-none" />

                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-violet-400" />
                                    Estructura de Pensamiento
                                </h2>
                                <div className="px-3 py-1 rounded-full bg-violet-500/10 text-violet-400 text-[10px] font-bold uppercase tracking-widest">Vista Lógica</div>
                            </div>

                            <div className="space-y-4">
                                {themes.slice(0, 4).map((theme) => {
                                    const themeCategories = categories.filter(c => c.themeId === theme.id);
                                    const themeNotesCount = notes.filter(n => themeCategories.find(c => c.id === n.categoryId)).length;
                                    const percentage = notes.length > 0 ? (themeNotesCount / notes.length) * 100 : 0;

                                    return (
                                        <div key={theme.id} className="space-y-2">
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-zinc-300 font-medium flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                                                    {theme.name}
                                                </span>
                                                <span className="text-zinc-500">{themeNotesCount} notas</span>
                                            </div>
                                            <div className="h-2 w-full bg-[#1a1a1e] rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${percentage}%` }}
                                                    transition={{ duration: 1, ease: "easeOut" }}
                                                    className="h-full bg-gradient-to-r from-violet-600 to-indigo-500 rounded-full"
                                                />
                                            </div>
                                        </div>
                                    );
                                })}

                                {themes.length === 0 && (
                                    <div className="h-40 flex flex-col items-center justify-center text-zinc-600 border border-dashed border-zinc-800 rounded-2xl">
                                        <Brain className="w-8 h-8 opacity-20 mb-2" />
                                        <p className="text-sm">Crea temas para ver tu mapa mental</p>
                                    </div>
                                )}
                            </div>

                            <div className="mt-12 grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-2xl bg-[#0c0c0e] border border-[#26262b] flex items-center gap-3">
                                    <Zap className="w-5 h-5 text-amber-400" />
                                    <div>
                                        <div className="text-white font-bold text-sm">Productividad</div>
                                        <div className="text-zinc-500 text-[10px]">Mapa en crecimiento</div>
                                    </div>
                                </div>
                                <div className="p-4 rounded-2xl bg-[#0c0c0e] border border-[#26262b] flex items-center gap-3">
                                    <Clock className="w-5 h-5 text-blue-400" />
                                    <div>
                                        <div className="text-white font-bold text-sm">Última Actividad</div>
                                        <div className="text-zinc-500 text-[10px]">Hace un momento</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right: Recent Notes */}
                    <motion.div
                        variants={item}
                        initial="hidden"
                        animate="show"
                        className="space-y-6"
                    >
                        <div className="p-6 rounded-3xl bg-[#141417] border border-[#26262b] h-full">
                            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-emerald-400" />
                                Notas Recientes
                            </h2>
                            <div className="space-y-3">
                                {recentNotes.map((note) => (
                                    <div
                                        key={note.id}
                                        className="p-4 rounded-2xl bg-[#1a1a1e] border border-[#26262b] hover:border-violet-500/30 transition-all cursor-pointer group"
                                    >
                                        <h3 className="text-sm font-bold text-white mb-1 group-hover:text-violet-400 transition-colors truncate">
                                            {note.title || 'Sin título'}
                                        </h3>
                                        <div className="flex items-center justify-between text-[10px] text-zinc-500">
                                            <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
                                            <div className="flex items-center gap-1">
                                                <div className="w-1 h-1 rounded-full bg-zinc-700" />
                                                <span>{categories.find(c => c.id === note.categoryId)?.name || 'Sueltas'}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {notes.length === 0 && (
                                    <p className="text-zinc-600 text-sm text-center py-8">No hay notas recientes</p>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};
