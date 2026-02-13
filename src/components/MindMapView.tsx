import React, { useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';
import { motion } from 'framer-motion';
import { Brain, FileText, Hash, MousePointer2, Eye, EyeOff } from 'lucide-react';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

export const MindMapView: React.FC = () => {
    const { themes, categories, notes, setSelectedNote, isDashboardUiVisible, toggleDashboardUi } = useAppStore();

    const themeNodes = useMemo(() => {
        const radius = 350; // Increased radius for better spacing
        const centerX = 1000; // Centering in a larger canvas
        const centerY = 1000;

        return themes.map((theme, index) => {
            const angle = (index / themes.length) * 2 * Math.PI - Math.PI / 2;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);

            const themeCategories = categories.filter(c => c.themeId === theme.id).map((cat, catIdx) => {
                const catRadius = 150;
                const catAngle = angle + (catIdx - (categories.filter(c => c.themeId === theme.id).length - 1) / 2) * 0.5;
                const cx = x + catRadius * Math.cos(catAngle);
                const cy = y + catRadius * Math.sin(catAngle);

                const catNotes = notes.filter(n => n.categoryId === cat.id);

                return { ...cat, x: cx, y: cy, notes: catNotes };
            });

            return {
                ...theme,
                x,
                y,
                categories: themeCategories
            };
        });
    }, [themes, categories, notes]);

    if (themes.length === 0) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-zinc-600">
                <Brain className="w-12 h-12 opacity-20 mb-4" />
                <p className="text-lg">Crea algunos temas para generar tu mapa mental automático.</p>
            </div>
        );
    }

    return (
        <div className="w-full h-full relative cursor-grab active:cursor-grabbing overflow-hidden rounded-3xl">
            <TransformWrapper
                initialScale={0.8}
                initialPositionX={0}
                initialPositionY={0}
                minScale={0.2}
                maxScale={2}
                centerOnInit={true}
            >
                <TransformComponent wrapperClass="!w-full !h-full" contentClass="!w-[2000px] !h-[2000px]">
                    <div className="relative w-[2000px] h-[2000px]">
                        {/* Grid Background (inside transform for consistency) */}
                        <div className="absolute inset-0 opacity-[0.02] pointer-events-none"
                            style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '50px 50px' }}
                        />

                        <svg className="absolute inset-0 w-full h-full pointer-events-none">
                            {/* Connection Paths: Center to Themes */}
                            {themeNodes.map((node, i) => (
                                <g key={`group-${node.id}`}>
                                    <motion.path
                                        initial={{ pathLength: 0, opacity: 0 }}
                                        animate={{ pathLength: 1, opacity: 0.15 }}
                                        transition={{ duration: 1.5, delay: i * 0.1 }}
                                        d={`M 1000 1000 Q ${1000 + (node.x - 1000) * 0.5} ${1000 + (node.y - 1000) * 0.2} ${node.x} ${node.y}`}
                                        stroke="white"
                                        strokeWidth="3"
                                        fill="none"
                                    />

                                    {/* Connection Paths: Theme to Categories */}
                                    {node.categories.map((cat, j) => (
                                        <motion.path
                                            key={`cat-path-${cat.id}`}
                                            initial={{ pathLength: 0, opacity: 0 }}
                                            animate={{ pathLength: 1, opacity: 0.1 }}
                                            transition={{ duration: 1, delay: 1 + i * 0.1 + j * 0.05 }}
                                            d={`M ${node.x} ${node.y} L ${cat.x} ${cat.y}`}
                                            stroke="white"
                                            strokeWidth="2"
                                            strokeDasharray="6 6"
                                            fill="none"
                                        />
                                    ))}
                                </g>
                            ))}
                        </svg>

                        {/* Central Node */}
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute left-[950px] top-[950px] w-24 h-24 bg-violet-600 rounded-4xl flex items-center justify-center shadow-[0_0_80px_rgba(139,92,246,0.3)] z-30 border-2 border-violet-400/50"
                        >
                            <Brain className="w-12 h-12 text-white" />
                            <div className="absolute -bottom-10 whitespace-nowrap text-zinc-400 font-black tracking-[0.2em] text-[12px] uppercase">
                                mApp Mental
                            </div>
                        </motion.div>

                        {/* Theme Nodes and Their Children */}
                        {themeNodes.map((node, i) => (
                            <React.Fragment key={node.id}>
                                {/* Theme Node */}
                                <motion.div
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ type: 'spring', damping: 12, delay: i * 0.1 }}
                                    style={{ left: node.x - 90, top: node.y - 35 }}
                                    className="absolute z-20"
                                >
                                    <div className="relative px-8 py-4 rounded-3xl bg-border-subtle border-2 border-violet-500/30 shadow-2xl min-w-[180px] text-center group cursor-default">
                                        <div className="absolute inset-0 rounded-3xl bg-linear-to-br from-violet-500/10 to-purple-500/10 opacity-10 blur-2xl -z-10" />
                                        <h3 className="text-white font-bold text-base truncate">{node.name}</h3>
                                    </div>
                                </motion.div>

                                {/* Category Nodes */}
                                {node.categories.map((cat, j) => (
                                    <motion.div
                                        key={cat.id}
                                        initial={{ opacity: 0, scale: 0 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 1 + i * 0.1 + j * 0.05 }}
                                        style={{ left: cat.x - 70, top: cat.y - 25 }}
                                        className="absolute z-10"
                                    >
                                        <div className="px-4 py-2 rounded-2xl bg-surface/90 border border-zinc-800 shadow-lg min-w-[140px] group flex flex-col gap-1.5 backdrop-blur-sm">
                                            <div className="flex items-center gap-2">
                                                <Hash className="w-3.5 h-3.5 text-zinc-500" />
                                                <span className="text-zinc-300 text-[12px] font-bold truncate">{cat.name}</span>
                                            </div>

                                            {/* Notes inside Category */}
                                            <div className="flex flex-col gap-1.5 mt-1 pl-4 border-l-2 border-zinc-800">
                                                {cat.notes.map((note) => (
                                                    <button
                                                        key={note.id}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedNote(note.id);
                                                        }}
                                                        className="flex items-center gap-2 text-zinc-500 hover:text-violet-400 text-[10px] transition-colors text-left group/note"
                                                    >
                                                        <FileText className="w-3 h-3 shrink-0" />
                                                        <span className="truncate max-w-[100px]">{note.title || 'Sin título'}</span>
                                                    </button>
                                                ))}
                                                {cat.notes.length === 0 && (
                                                    <span className="text-[9px] text-zinc-700 italic">Sin notas</span>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </React.Fragment>
                        ))}
                    </div>
                </TransformComponent>
            </TransformWrapper>

            {/* UI Toggle & Legend Helper */}
            <div className="absolute bottom-6 left-6 flex items-center gap-4 z-40 px-1">
                <button
                    onClick={toggleDashboardUi}
                    className="flex items-center gap-2 px-4 py-2 bg-surface/80 backdrop-blur-md rounded-full border border-border text-[10px] text-zinc-300 hover:text-white hover:bg-surface transition-all font-bold uppercase tracking-widest shadow-lg pointer-events-auto"
                >
                    {isDashboardUiVisible ? (
                        <>
                            <EyeOff className="w-3.5 h-3.5" />
                            Ocultar UI
                        </>
                    ) : (
                        <>
                            <Eye className="w-3.5 h-3.5" />
                            Mostrar UI
                        </>
                    )}
                </button>

                <div className="flex items-center gap-4 px-4 py-2 bg-surface/40 backdrop-blur-md rounded-full border border-border/50 text-[10px] text-zinc-500 font-bold uppercase tracking-widest pointer-events-none">
                    <div className="flex items-center gap-2">
                        <MousePointer2 className="w-3 h-3" />
                        Arrastrar para mover
                    </div>
                    <div className="w-1 h-1 rounded-full bg-zinc-700" />
                    <div>Scroll para Zoom</div>
                </div>
            </div>
        </div>
    );
};
