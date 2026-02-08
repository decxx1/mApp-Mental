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
    Brain,
    GripVertical,
    Star
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useModal } from '../hooks/useModal';
import {
    DndContext,
    DragOverlay,
    useDraggable,
    useDroppable,
    DragEndEvent,
    PointerSensor,
    useSensor,
    useSensors,
    defaultDropAnimationSideEffects,
    closestCenter
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// --- Draggable Note Component ---
interface DraggableNoteProps {
    note: any;
    selectedNoteId: string | null;
    setSelectedNote: (id: string) => void;
    handleDeleteNote: (id: string) => void;
}

const DraggableNote: React.FC<DraggableNoteProps> = ({ note, selectedNoteId, setSelectedNote, handleDeleteNote }) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: `note-${note.id}`,
        data: {
            type: 'note',
            noteId: note.id
        }
    });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 50 : 'auto',
    } : undefined;

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                "group flex items-center justify-between p-1.5 px-3 rounded-md cursor-pointer text-[13px] transition-all duration-200",
                selectedNoteId === note.id ? "bg-violet-700/10 text-violet-400" : "text-zinc-500 hover:text-zinc-300 hover:bg-[#1a1a1e]"
            )}
            onClick={() => setSelectedNote(note.id)}
        >
            <div className="flex items-center gap-2 overflow-hidden flex-1">
                <div {...listeners} {...attributes} className="cursor-grab active:cursor-grabbing p-1 -ml-1 hover:bg-zinc-800 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    <GripVertical className="w-3 h-3 text-zinc-600" />
                </div>
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
    );
};

// --- Droppable Category Component ---
interface DroppableCategoryProps {
    category: any;
    selectedCategoryId: string | null;
    setSelectedCategory: (id: string | null) => void;
    handleAddNote: (categoryId: string) => void;
    handleDeleteCategory: (id: string) => void;
    children: React.ReactNode;
}

const DroppableCategory: React.FC<DroppableCategoryProps> = ({
    category,
    selectedCategoryId,
    setSelectedCategory,
    handleAddNote,
    handleDeleteCategory,
    children
}) => {
    const { setNodeRef, isOver } = useDroppable({
        id: `category-${category.id}`,
        data: {
            type: 'category',
            categoryId: category.id
        }
    });

    return (
        <div ref={setNodeRef} className={cn("space-y-1 rounded-lg transition-colors p-0.5", isOver && "bg-violet-800/5 ring-1 ring-violet-500/30")}>
            <div
                className={cn(
                    "group flex items-center justify-between p-2 rounded-lg cursor-pointer text-sm transition-all duration-200",
                    selectedCategoryId === category.id ? "bg-[#1f1f23] text-violet-400" : "text-zinc-400 hover:text-white hover:bg-[#1a1a1e]"
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
                    {children}
                </div>
            )}
        </div>
    );
}

// --- Sortable Theme Component ---
interface SortableThemeItemProps {
    theme: any;
    isSelected: boolean;
    isExpanded: boolean;
    onToggle: () => void;
    onAddCategory: () => void;
    onDelete: () => void;
    onFavorite: () => void;
    children?: React.ReactNode;
}

const SortableThemeItem: React.FC<SortableThemeItemProps> = ({
    theme, isSelected, isExpanded, onToggle, onAddCategory, onDelete, onFavorite, children
}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({
        id: theme.id,
        data: {
            type: 'theme',
            themeId: theme.id
        }
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1, // Slightly more transparent when dragging
        zIndex: isDragging ? 100 : 'auto',
    };

    return (
        <div ref={setNodeRef} style={style} className="space-y-1">
            <div
                className={cn(
                    "group flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all duration-200",
                    isSelected ? "bg-[#1f1f23] text-violet-400" : "hover:bg-[#1a1a1e]"
                )}
                onClick={onToggle}
            >
                <div className="flex items-center gap-2 overflow-hidden flex-1">
                    <div {...listeners} {...attributes} className="cursor-grab active:cursor-grabbing p-1 -ml-1 hover:bg-zinc-800 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        <GripVertical className="w-3.5 h-3.5 text-zinc-600" />
                    </div>
                    {isExpanded ? <ChevronDown className="w-4 h-4 flex-shrink-0" /> : <ChevronRight className="w-4 h-4 flex-shrink-0" />}
                    <span className="font-medium truncate">{theme.name}</span>
                    {theme.isFavorite && <Star className="w-2.5 h-2.5 text-amber-500 fill-amber-500 ml-auto mr-2" />}
                </div>
                <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={(e) => { e.stopPropagation(); onFavorite(); }}
                        className={cn("p-1 hover:bg-[#2b2b31] rounded transition-colors", theme.isFavorite ? "text-amber-500" : "text-zinc-500 hover:text-zinc-300")}
                    >
                        <Star className={cn("w-3.5 h-3.5", theme.isFavorite && "fill-amber-500")} />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onAddCategory(); }}
                        className="p-1 hover:bg-[#2b2b31] rounded text-zinc-500 hover:text-zinc-300"
                    >
                        <FolderPlus className="w-3.5 h-3.5" />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(); }}
                        className="p-1 hover:bg-red-500/10 hover:text-red-400 rounded transition-colors text-zinc-500"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
            {isExpanded && children && (
                <div className="ml-4 pl-2 border-l border-[#26262b] space-y-1 duration-200">
                    {children}
                </div>
            )}
        </div>
    );
};

// --- Uncategorized Drop Zone ---
const UncategorizedDropZone: React.FC<{ isVisible: boolean }> = ({ isVisible }) => {
    const { setNodeRef, isOver } = useDroppable({
        id: 'category-inbox',
        data: {
            type: 'category',
            categoryId: 'inbox'
        }
    });

    if (!isVisible && !isOver) return null;

    return (
        <div
            ref={setNodeRef}
            className={cn(
                "px-3 py-4 rounded-lg border border-dashed text-[11px] text-zinc-600 transition-all text-center",
                isOver ? "bg-violet-700/20 border-violet-500 text-violet-400" : "border-zinc-800"
            )}
        >
            {isOver ? 'Suelta para desclasificar' : 'Arrastra aquí para soltar notas'}
        </div>
    );
};

// --- Main Sidebar Component ---
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
        deleteNote,
        moveNote,
        toggleThemeFavorite,
        reorderThemes
    } = useAppStore();

    const { prompt, confirm } = useModal();
    const [expandedThemes, setExpandedThemes] = useState<Record<string, boolean>>({});
    const [activeId, setActiveId] = useState<string | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5, // Reduced distance for faster activation
            },
        })
    );

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

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over) {
            setActiveId(null);
            return;
        }

        const activeData = active.data.current;
        const overData = over.data.current;

        // --- LOGIC FOR REORDERING THEMES ---
        if (activeData?.type === 'theme') {
            const activeId = active.id as string;
            const overId = over.id as string;

            if (activeId !== overId) {
                const activeIndex = themes.findIndex(t => t.id === activeId);
                const overIndex = themes.findIndex(t => t.id === overId);

                if (activeIndex !== -1 && overIndex !== -1) {
                    reorderThemes(arrayMove(themes, activeIndex, overIndex));
                }
            }
        }

        // --- LOGIC FOR MOVING NOTES ---
        if (activeData?.type === 'note' && overData?.type === 'category') {
            moveNote(activeData.noteId, overData.categoryId);
        }

        setActiveId(null);
    };

    const favoriteThemes = themes.filter(t => t.isFavorite);
    const regularThemes = themes.filter(t => !t.isFavorite);

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={(event) => setActiveId(event.active.id as string)}
            onDragEnd={handleDragEnd}
            onDragCancel={() => setActiveId(null)}
        >
            <div className="w-72 h-screen bg-[#141417] border-r border-[#26262b] flex flex-col text-[#e2e8f0] overflow-hidden select-none">
                <div
                    className="p-6 flex items-center gap-3 border-b border-[#26262b] cursor-pointer hover:bg-white/[0.02] transition-colors"
                    onClick={() => {
                        setSelectedNote(null);
                        setSelectedTheme(null);
                        setSelectedCategory(null);
                    }}
                >
                    <div className="w-10 h-10 bg-violet-700 rounded-xl flex items-center justify-center shadow-lg shadow-violet-900/30">
                        <Brain className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="font-bold text-lg tracking-tight">mApp Mental</h1>
                        <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">Organiza tus ideas</p>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-8 custom-scrollbar">
                    {/* Section: Loose Notes */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between px-2 mb-2">
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Notas Sueltas</span>
                            <button
                                onClick={() => handleAddNote('inbox')}
                                className="p-1 hover:bg-[#26262b] rounded-md transition-colors text-zinc-400 hover:text-white"
                            >
                                <Plus className="w-3.5 h-3.5" />
                            </button>
                        </div>

                        <div className="space-y-0.5 px-1">
                            {notes.filter(n => n.categoryId === 'inbox').map(note => (
                                <DraggableNote
                                    key={note.id}
                                    note={note}
                                    selectedNoteId={selectedNoteId}
                                    setSelectedNote={setSelectedNote}
                                    handleDeleteNote={handleDeleteNote}
                                />
                            ))}
                            <UncategorizedDropZone isVisible={notes.filter(n => n.categoryId === 'inbox').length === 0} />
                        </div>
                    </div>

                    {/* Section: Favorites (Only view, non-sortable separately to avoid conflicts) */}
                    {favoriteThemes.length > 0 && (
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 px-2 mb-2">
                                <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                                <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Favoritos</span>
                            </div>
                            <div className="space-y-1">
                                {favoriteThemes.map((theme) => (
                                    <div key={theme.id} className="group relative">
                                        <div
                                            className={cn(
                                                "flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all duration-200",
                                                selectedThemeId === theme.id ? "bg-[#1f1f23] text-violet-400" : "hover:bg-[#1a1a1e] text-zinc-400"
                                            )}
                                            onClick={() => toggleTheme(theme.id)}
                                        >
                                            <div className="flex items-center gap-2 overflow-hidden flex-1">
                                                {expandedThemes[theme.id] ? <ChevronDown className="w-4 h-4 flex-shrink-0" /> : <ChevronRight className="w-4 h-4 flex-shrink-0" />}
                                                <span className="font-medium truncate">{theme.name}</span>
                                            </div>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); toggleThemeFavorite(theme.id); }}
                                                className="opacity-0 group-hover:opacity-100 p-1 text-amber-500"
                                            >
                                                <Star className="w-3.5 h-3.5 fill-current" />
                                            </button>
                                        </div>
                                        {expandedThemes[theme.id] && (
                                            <div className="ml-4 pl-2 border-l border-[#26262b] space-y-1 mt-1">
                                                {categories.filter(c => c.themeId === theme.id).map(category => (
                                                    <DroppableCategory
                                                        key={category.id}
                                                        category={category}
                                                        selectedCategoryId={selectedCategoryId}
                                                        setSelectedCategory={setSelectedCategory}
                                                        handleAddNote={handleAddNote}
                                                        handleDeleteCategory={handleDeleteCategory}
                                                    >
                                                        {notes.filter(n => n.categoryId === category.id).map(note => (
                                                            <DraggableNote
                                                                key={note.id}
                                                                note={note}
                                                                selectedNoteId={selectedNoteId}
                                                                setSelectedNote={setSelectedNote}
                                                                handleDeleteNote={handleDeleteNote}
                                                            />
                                                        ))}
                                                    </DroppableCategory>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Section: Themes (Sortable) */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between px-2 mb-2">
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Temas</span>
                            <button
                                onClick={handleAddTheme}
                                className="p-1 hover:bg-[#26262b] rounded-md transition-colors text-zinc-400 hover:text-white"
                            >
                                <Plus className="w-3.5 h-3.5" />
                            </button>
                        </div>

                        {themes.length === 0 && (
                            <div className="px-4 py-8 text-center text-zinc-600 text-[11px] italic">
                                No hay temas todavía.
                            </div>
                        )}

                        <SortableContext
                            items={themes.map(t => t.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            <div className="space-y-1">
                                {themes.map((theme) => (
                                    <SortableThemeItem
                                        key={theme.id}
                                        theme={theme}
                                        isSelected={selectedThemeId === theme.id}
                                        isExpanded={expandedThemes[theme.id]}
                                        onToggle={() => toggleTheme(theme.id)}
                                        onAddCategory={() => handleAddCategory(theme.id)}
                                        onDelete={() => handleDeleteTheme(theme.id)}
                                        onFavorite={() => toggleThemeFavorite(theme.id)}
                                    >
                                        {categories.filter(c => c.themeId === theme.id).map(category => (
                                            <DroppableCategory
                                                key={category.id}
                                                category={category}
                                                selectedCategoryId={selectedCategoryId}
                                                setSelectedCategory={setSelectedCategory}
                                                handleAddNote={handleAddNote}
                                                handleDeleteCategory={handleDeleteCategory}
                                            >
                                                {notes.filter(n => n.categoryId === category.id).map(note => (
                                                    <DraggableNote
                                                        key={note.id}
                                                        note={note}
                                                        selectedNoteId={selectedNoteId}
                                                        setSelectedNote={setSelectedNote}
                                                        handleDeleteNote={handleDeleteNote}
                                                    />
                                                ))}
                                            </DroppableCategory>
                                        ))}
                                    </SortableThemeItem>
                                ))}
                            </div>
                        </SortableContext>
                    </div>
                </div>

                <div className="mt-auto p-4 border-t border-[#26262b]/50">
                    <p className="text-[10px] text-zinc-600 text-center uppercase tracking-widest font-medium">mApp Mental v1.0</p>
                </div>
            </div>

            <DragOverlay dropAnimation={{
                sideEffects: defaultDropAnimationSideEffects({
                    styles: {
                        active: {
                            opacity: '0.4',
                        },
                    },
                }),
            }}>
                {activeId && activeId.startsWith('note-') ? (
                    <div className="flex items-center gap-2 p-1.5 px-3 rounded-md bg-[#1f1f23] text-violet-400 shadow-xl border border-violet-500/30 w-56 cursor-grabbing">
                        <FileText className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate text-[13px] font-medium">
                            {notes.find(n => `note-${n.id}` === activeId)?.title || 'Nota'}
                        </span>
                    </div>
                ) : activeId && themes.find(t => t.id === activeId) ? (
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-[#1f1f23] text-violet-400 shadow-2xl border border-violet-500/50 w-64 cursor-grabbing">
                        <GripVertical className="w-3.5 h-3.5 text-zinc-500" />
                        <ChevronRight className="w-4 h-4" />
                        <span className="font-medium truncate">{themes.find(t => t.id === activeId)?.name}</span>
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
};
