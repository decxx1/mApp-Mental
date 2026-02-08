import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import {
    ChevronRight,
    ChevronDown,
    Plus,
    FolderPlus,
    Hash,
    FileText,
    Trash2,
    MoreVertical,
    Brain
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

import { useModal } from '../hooks/useModal';

export const Sidebar: React.FC = () => {
    const {
        themes,
        categories,
        notes,
        addTheme,
        addCategory,
        addNote,
        selectedNoteId,
        selectedThemeId,
        selectedCategoryId,
        setSelectedNote,
        setSelectedTheme,
        setSelectedCategory,
        deleteTheme,
        deleteCategory,
        deleteNote
    } = useAppStore();

    const { prompt, confirm } = useModal();
    const [expandedThemes, setExpandedThemes] = useState<Record<string, boolean>>({});

    const toggleTheme = (id: string) => {
        setExpandedThemes(prev => ({ ...prev, [id]: !prev[id] }));
        setSelectedTheme(id);
    };

    const handleAddTheme = async () => {
        const name = await prompt('Nuevo Tema', 'Ingresa el nombre del tema para organizar tus ideas:');
        if (name) addTheme(name, 'Brain');
    };

    const handleAddCategory = async (themeId: string) => {
        const name = await prompt('Nueva Categoría', 'Nombra esta categoría dentro del tema:');
        if (name) addCategory(themeId, name);
    };

    const handleAddNote = async (categoryId: string) => {
        const title = await prompt('Nueva Nota', 'Título para tu nueva nota:');
        if (title) {
            const id = addNote(categoryId, title);
            setSelectedNote(id);
        }
    };

    const handleDeleteTheme = async (id: string) => {
        const ok = await confirm('¿Eliminar Tema?', 'Esto borrará todas las categorías y notas asociadas. Esta acción no se puede deshacer.');
        if (ok) deleteTheme(id);
    };

    const handleDeleteCategory = async (id: string) => {
        const ok = await confirm('¿Eliminar Categoría?', 'Todas las notas en esta categoría serán eliminadas.');
        if (ok) deleteCategory(id);
    };

    const handleDeleteNote = async (id: string) => {
        const ok = await confirm('¿Eliminar Nota?', '¿Estás seguro de que quieres borrar esta nota?');
        if (ok) deleteNote(id);
    };

    return (
        <div className="w-72 h-screen bg-[#141417] border-r border-[#26262b] flex flex-col text-[#e2e8f0] overflow-hidden select-none">
            <div className="p-6 flex items-center gap-3 border-b border-[#26262b]">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                    <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h1 className="font-bold text-lg tracking-tight">mApp Mental</h1>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">Organiza tus ideas</p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                <div className="flex items-center justify-between mb-2 px-2">
                    <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Temas</span>
                    <button
                        onClick={handleAddTheme}
                        className="p-1 hover:bg-[#26262b] rounded-md transition-colors text-zinc-400 hover:text-white"
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                </div>

                {themes.length === 0 && (
                    <div className="px-4 py-8 text-center">
                        <p className="text-sm text-zinc-600">No hay temas todavía.</p>
                    </div>
                )}

                {themes.map((theme) => (
                    <div key={theme.id} className="space-y-1">
                        <div
                            className={cn(
                                "group flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all duration-200",
                                selectedThemeId === theme.id ? "bg-[#1f1f23] text-indigo-400" : "hover:bg-[#1a1a1e]"
                            )}
                            onClick={() => toggleTheme(theme.id)}
                        >
                            <div className="flex items-center gap-2 overflow-hidden">
                                {expandedThemes[theme.id] ? <ChevronDown className="w-4 h-4 flex-shrink-0" /> : <ChevronRight className="w-4 h-4 flex-shrink-0" />}
                                <span className="font-medium truncate">{theme.name}</span>
                            </div>
                            <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleAddCategory(theme.id); }}
                                    className="p-1 hover:bg-[#2b2b31] rounded"
                                >
                                    <FolderPlus className="w-3.5 h-3.5" />
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleDeleteTheme(theme.id); }}
                                    className="p-1 hover:bg-red-500/10 hover:text-red-400 rounded transition-colors"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>

                        {expandedThemes[theme.id] && (
                            <div className="ml-4 pl-2 border-l border-[#26262b] space-y-1 animate-in fade-in slide-in-from-left-2 duration-200">
                                {categories.filter(c => c.themeId === theme.id).map(category => (
                                    <div key={category.id} className="space-y-1">
                                        <div
                                            className={cn(
                                                "group flex items-center justify-between p-2 rounded-lg cursor-pointer text-sm transition-all duration-200",
                                                selectedCategoryId === category.id ? "bg-[#1f1f23] text-indigo-400" : "text-zinc-400 hover:text-white hover:bg-[#1a1a1e]"
                                            )}
                                            onClick={() => setSelectedCategory(category.id === selectedCategoryId ? null : category.id)}
                                        >
                                            <div className="flex items-center gap-2 overflow-hidden">
                                                <Hash className="w-4 h-4 flex-shrink-0 opacity-50" />
                                                <span className="truncate">{category.name}</span>
                                            </div>
                                            <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleAddNote(category.id); }}
                                                    className="p-1 hover:bg-[#2b2b31] rounded"
                                                >
                                                    <Plus className="w-3 h-3" />
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleDeleteCategory(category.id); }}
                                                    className="p-1 hover:bg-red-500/10 hover:text-red-400 rounded transition-colors"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </div>

                                        {selectedCategoryId === category.id && (
                                            <div className="ml-4 space-y-0.5 animate-in fade-in slide-in-from-top-1">
                                                {notes.filter(n => n.categoryId === category.id).map(note => (
                                                    <div
                                                        key={note.id}
                                                        className={cn(
                                                            "group flex items-center justify-between p-1.5 px-3 rounded-md cursor-pointer text-[13px] transition-all duration-200",
                                                            selectedNoteId === note.id ? "bg-indigo-600/10 text-indigo-400" : "text-zinc-500 hover:text-zinc-300 hover:bg-[#1a1a1e]"
                                                        )}
                                                        onClick={() => setSelectedNote(note.id)}
                                                    >
                                                        <div className="flex items-center gap-2 overflow-hidden">
                                                            <FileText className="w-3.5 h-3.5 flex-shrink-0" />
                                                            <span className="truncate">{note.title || 'Sin título'}</span>
                                                        </div>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleDeleteNote(note.id); }}
                                                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/10 hover:text-red-400 rounded transition-colors"
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="p-4 bg-[#0c0c0e] border-t border-[#26262b] flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-zinc-800 to-zinc-700 flex items-center justify-center">
                        <span className="text-[10px] font-bold">U</span>
                    </div>
                    <p className="text-xs font-medium text-zinc-400">Usuario Local</p>
                </div>
                <button className="p-1.5 hover:bg-[#1a1a1e] rounded-md transition-colors text-zinc-500">
                    <MoreVertical className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};
