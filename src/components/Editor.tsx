import React, { useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import { useAppStore } from '../store/useAppStore';
import {
    Bold,
    Italic,
    List,
    ListOrdered,
    Heading1,
    Heading2,
    Quote,
    Save,
    Clock,
    Type,
    Table as TableIcon,
    Trash2,
    ChevronRight,
    Folder,
    Hash,
    Highlighter,
    AlignLeft,
    AlignCenter,
    AlignRight,
    AlignJustify,
    ChevronDown,
    Text as TextIcon
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const Editor: React.FC = () => {
    const { notes, categories, themes, selectedNoteId, updateNote } = useAppStore();
    const activeNote = notes.find(n => n.id === selectedNoteId);
    const activeCategory = categories.find(c => c.id === activeNote?.categoryId);
    const activeTheme = themes.find(t => t.id === activeCategory?.themeId);

    const [headingMenuOpen, setHeadingMenuOpen] = useState(false);
    const [alignMenuOpen, setAlignMenuOpen] = useState(false);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3, 4, 5, 6],
                },
            }),
            Placeholder.configure({
                placeholder: 'Empieza a escribir algo increíble...',
            }),
            Table.configure({
                resizable: true,
            }),
            TableRow,
            TableHeader,
            TableCell,
            Highlight.configure({
                multicolor: true,
            }),
            TextAlign.configure({
                types: ['heading', 'paragraph'],
                alignments: ['left', 'center', 'right', 'justify'],
                defaultAlignment: 'left',
            }),
        ],
        content: '',
        onUpdate: ({ editor }) => {
            if (activeNote) {
                updateNote(activeNote.id, activeNote.title, editor.getHTML());
            }
        },
        editorProps: {
            attributes: {
                class: 'focus:outline-none min-h-[500px] text-zinc-300',
            },
        },
    }, [selectedNoteId]);

    useEffect(() => {
        if (editor && activeNote && editor.getHTML() !== activeNote.content) {
            editor.commands.setContent(activeNote.content);
        }
    }, [activeNote?.id, editor]);

    if (!activeNote) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center bg-background text-zinc-600">
                <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mb-4 border border-border">
                    <Type className="w-8 h-8 opacity-20" />
                </div>
                <h2 className="text-xl font-medium text-zinc-500">Selecciona o crea una nota</h2>
                <p className="text-sm">Organiza tus pensamientos paso a paso.</p>
            </div>
        );
    }

    const getCurrentHeading = () => {
        if (editor?.isActive('heading', { level: 1 })) return 'Título 1';
        if (editor?.isActive('heading', { level: 2 })) return 'Título 2';
        if (editor?.isActive('heading', { level: 3 })) return 'Título 3';
        if (editor?.isActive('heading', { level: 4 })) return 'Título 4';
        if (editor?.isActive('heading', { level: 5 })) return 'Título 5';
        if (editor?.isActive('heading', { level: 6 })) return 'Título 6';
        return 'Párrafo';
    };

    const getCurrentAlignmentIcon = () => {
        if (editor?.isActive({ textAlign: 'center' })) return <AlignCenter className="w-4 h-4" />;
        if (editor?.isActive({ textAlign: 'right' })) return <AlignRight className="w-4 h-4" />;
        if (editor?.isActive({ textAlign: 'justify' })) return <AlignJustify className="w-4 h-4" />;
        return <AlignLeft className="w-4 h-4" />;
    };

    return (
        <div className="flex flex-col bg-background overflow-hidden">
            <div className="border-b border-border bg-background/80 backdrop-blur-sm z-20 sticky top-0">
                <div className="h-8 px-6 flex items-center gap-2 text-[11px] font-medium text-zinc-500 border-b border-border-subtle">
                    {activeNote?.categoryId === 'inbox' ? (
                        <span className="hover:text-zinc-300 cursor-default">Notas Sueltas</span>
                    ) : (
                        <>
                            {activeTheme && (
                                <>
                                    <div className="flex items-center gap-1.5 hover:text-zinc-300 cursor-default">
                                        <Folder className="w-3 h-3" />
                                        <span>{activeTheme.name}</span>
                                    </div>
                                    <ChevronRight className="w-3 h-3 opacity-30" />
                                </>
                            )}
                            {activeCategory && (
                                <>
                                    <div className="flex items-center gap-1.5 hover:text-zinc-300 cursor-default">
                                        <Hash className="w-3 h-3" />
                                        <span>{activeCategory.name}</span>
                                    </div>
                                    <ChevronRight className="w-3 h-3 opacity-30" />
                                </>
                            )}
                        </>
                    )}
                    <span className="text-violet-400 truncate">{activeNote.title || 'Sin título'}</span>
                </div>

                <div className="h-12 flex items-center justify-between px-6">
                    <div className="flex items-center gap-1">
                        {/* Heading Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setHeadingMenuOpen(!headingMenuOpen)}
                                onBlur={() => setTimeout(() => setHeadingMenuOpen(false), 200)}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-surface-hover transition-colors text-xs font-medium text-zinc-400 min-w-[100px]"
                            >
                                <TextIcon className="w-3.5 h-3.5" />
                                <span className="flex-1 text-left">{getCurrentHeading()}</span>
                                <ChevronDown className={cn("w-3 h-3 transition-transform", headingMenuOpen && "rotate-180")} />
                            </button>

                            {headingMenuOpen && (
                                <div className="absolute top-full left-0 mt-1 w-48 bg-surface border border-border rounded-lg shadow-xl py-1 z-50 overflow-hidden">
                                    {[
                                        { label: 'Párrafo', action: () => editor?.chain().focus().setParagraph().run(), active: !editor?.isActive('heading') },
                                        { label: 'Título 1', action: () => editor?.chain().focus().toggleHeading({ level: 1 }).run(), active: editor?.isActive('heading', { level: 1 }), icon: <Heading1 className="w-4 h-4" /> },
                                        { label: 'Título 2', action: () => editor?.chain().focus().toggleHeading({ level: 2 }).run(), active: editor?.isActive('heading', { level: 2 }), icon: <Heading2 className="w-4 h-4" /> },
                                        { label: 'Título 3', action: () => editor?.chain().focus().toggleHeading({ level: 3 }).run(), active: editor?.isActive('heading', { level: 3 }) },
                                        { label: 'Título 4', action: () => editor?.chain().focus().toggleHeading({ level: 4 }).run(), active: editor?.isActive('heading', { level: 4 }) },
                                        { label: 'Título 5', action: () => editor?.chain().focus().toggleHeading({ level: 5 }).run(), active: editor?.isActive('heading', { level: 5 }) },
                                        { label: 'Título 6', action: () => editor?.chain().focus().toggleHeading({ level: 6 }).run(), active: editor?.isActive('heading', { level: 6 }) },
                                    ].map((item, i) => (
                                        <button
                                            key={i}
                                            onClick={item.action}
                                            className={cn(
                                                "w-full flex items-center gap-3 px-3 py-2 text-xs text-left transition-colors",
                                                item.active ? "bg-primary/10 text-primary" : "text-zinc-400 hover:bg-surface-hover hover:text-zinc-200"
                                            )}
                                        >
                                            {item.icon || <div className="w-4 h-4 flex items-center justify-center font-bold text-[10px]">H{i}</div>}
                                            {item.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="w-px h-6 bg-border mx-1" />

                        <button
                            onClick={() => editor?.chain().focus().toggleBold().run()}
                            className={cn("p-2 rounded-md hover:bg-surface-hover transition-colors", editor?.isActive('bold') && "bg-primary/20 text-primary")}
                        >
                            <Bold className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => editor?.chain().focus().toggleItalic().run()}
                            className={cn("p-2 rounded-md hover:bg-surface-hover transition-colors", editor?.isActive('italic') && "bg-primary/20 text-primary")}
                        >
                            <Italic className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => editor?.chain().focus().toggleHighlight().run()}
                            className={cn("p-2 rounded-md hover:bg-surface-hover transition-colors", editor?.isActive('highlight') && "bg-primary/20 text-primary")}
                        >
                            <Highlighter className="w-4 h-4" />
                        </button>

                        <div className="w-px h-6 bg-border mx-1" />

                        {/* Alignment Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setAlignMenuOpen(!alignMenuOpen)}
                                onBlur={() => setTimeout(() => setAlignMenuOpen(false), 200)}
                                className="flex items-center gap-1 p-2 rounded-md hover:bg-surface-hover transition-colors text-zinc-400"
                            >
                                {getCurrentAlignmentIcon()}
                                <ChevronDown className="w-3 h-3" />
                            </button>

                            {alignMenuOpen && (
                                <div className="absolute top-full left-0 mt-1 bg-surface border border-border rounded-lg shadow-xl p-1 z-50 flex gap-1">
                                    {[
                                        { id: 'left', icon: <AlignLeft className="w-4 h-4" /> },
                                        { id: 'center', icon: <AlignCenter className="w-4 h-4" /> },
                                        { id: 'right', icon: <AlignRight className="w-4 h-4" /> },
                                        { id: 'justify', icon: <AlignJustify className="w-4 h-4" /> },
                                    ].map((item) => (
                                        <button
                                            key={item.id}
                                            onClick={() => editor?.chain().focus().setTextAlign(item.id).run()}
                                            className={cn(
                                                "p-2 rounded-md transition-colors",
                                                editor?.isActive({ textAlign: item.id }) ? "bg-primary/10 text-primary" : "text-zinc-500 hover:bg-surface-hover hover:text-zinc-200"
                                            )}
                                        >
                                            {item.icon}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="w-px h-6 bg-border mx-1" />
                        <button
                            onClick={() => editor?.chain().focus().toggleBulletList().run()}
                            className={cn("p-2 rounded-md hover:bg-surface-hover transition-colors", editor?.isActive('bulletList') && "bg-primary/20 text-primary")}
                        >
                            <List className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                            className={cn("p-2 rounded-md hover:bg-surface-hover transition-colors", editor?.isActive('orderedList') && "bg-primary/20 text-primary")}
                        >
                            <ListOrdered className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => editor?.chain().focus().toggleBlockquote().run()}
                            className={cn("p-2 rounded-md hover:bg-surface-hover transition-colors", editor?.isActive('blockquote') && "bg-primary/20 text-primary")}
                        >
                            <Quote className="w-4 h-4" />
                        </button>
                        <div className="w-px h-6 bg-border mx-1" />
                        <button
                            onClick={() => editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
                            className="p-2 rounded-md hover:bg-surface-hover transition-colors"
                            title="Insertar Tabla"
                        >
                            <TableIcon className="w-4 h-4" />
                        </button>
                        {editor?.isActive('table') && (
                            <button
                                onClick={() => editor?.chain().focus().deleteTable().run()}
                                className="p-2 rounded-md hover:bg-red-500/10 text-red-400 transition-colors"
                                title="Borrar Tabla"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-4 text-xs text-zinc-500">
                        <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Editado {new Date(activeNote.updatedAt).toLocaleTimeString()}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-emerald-500/80">
                            <Save className="w-3.5 h-3.5" />
                            <span className="font-medium">Auto-guardado</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="overflow-y-auto overflow-x-auto custom-scrollbar">
                <div className="py-12 px-8 w-7xl">
                    <input
                        type="text"
                        value={activeNote.title}
                        onChange={(e) => updateNote(activeNote.id, e.target.value, activeNote.content)}
                        placeholder="Título de la nota"
                        className="w-full text-4xl font-bold bg-transparent border-none outline-none mb-8 text-white placeholder:text-zinc-800 tracking-tight"
                    />
                    <EditorContent editor={editor} />
                </div>
            </div>
        </div>
    );
};
