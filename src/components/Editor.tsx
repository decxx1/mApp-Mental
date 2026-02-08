import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { useAppStore } from '../store/useAppStore';
import {
    Bold,
    Italic,
    List,
    ListOrdered,
    Heading1,
    Heading2,
    Quote,
    Undo,
    Redo,
    Save,
    Clock,
    Type,
    Table as TableIcon,
    Trash2
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const Editor: React.FC = () => {
    const { notes, selectedNoteId, updateNote } = useAppStore();
    const activeNote = notes.find(n => n.id === selectedNoteId);

    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({
                placeholder: 'Empieza a escribir algo increíble...',
            }),
            Table.configure({
                resizable: true,
            }),
            TableRow,
            TableHeader,
            TableCell,
        ],
        content: '',
        onUpdate: ({ editor }) => {
            if (activeNote) {
                updateNote(activeNote.id, activeNote.title, editor.getHTML());
            }
        },
        editorProps: {
            attributes: {
                class: 'prose prose-invert max-w-none focus:outline-none min-h-[500px] text-zinc-300',
            },
        },
    }, [selectedNoteId]); // Re-initialize when note changes

    useEffect(() => {
        if (editor && activeNote && editor.getHTML() !== activeNote.content) {
            editor.commands.setContent(activeNote.content);
        }
    }, [activeNote?.id, editor]);

    if (!activeNote) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center bg-[#0c0c0e] text-zinc-600">
                <div className="w-16 h-16 bg-[#141417] rounded-full flex items-center justify-center mb-4 border border-[#26262b]">
                    <Type className="w-8 h-8 opacity-20" />
                </div>
                <h2 className="text-xl font-medium text-zinc-500">Selecciona o crea una nota</h2>
                <p className="text-sm">Organiza tus pensamientos paso a paso.</p>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col bg-[#0c0c0e] overflow-hidden">
            {/* Editor Header / Toolbar */}
            <div className="h-14 border-b border-[#26262b] flex items-center justify-between px-6 bg-[#0c0c0e]/80 backdrop-blur-sm z-10 sticky top-0">
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => editor?.chain().focus().toggleBold().run()}
                        className={cn("p-2 rounded-md hover:bg-[#1f1f23] transition-colors", editor?.isActive('bold') && "bg-indigo-600/20 text-indigo-400")}
                    >
                        <Bold className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => editor?.chain().focus().toggleItalic().run()}
                        className={cn("p-2 rounded-md hover:bg-[#1f1f23] transition-colors", editor?.isActive('italic') && "bg-indigo-600/20 text-indigo-400")}
                    >
                        <Italic className="w-4 h-4" />
                    </button>
                    <div className="w-[1px] h-6 bg-[#26262b] mx-1" />
                    <button
                        onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
                        className={cn("p-2 rounded-md hover:bg-[#1f1f23] transition-colors", editor?.isActive('heading', { level: 1 }) && "bg-indigo-600/20 text-indigo-400")}
                    >
                        <Heading1 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
                        className={cn("p-2 rounded-md hover:bg-[#1f1f23] transition-colors", editor?.isActive('heading', { level: 2 }) && "bg-indigo-600/20 text-indigo-400")}
                    >
                        <Heading2 className="w-4 h-4" />
                    </button>
                    <div className="w-[1px] h-6 bg-[#26262b] mx-1" />
                    <button
                        onClick={() => editor?.chain().focus().toggleBulletList().run()}
                        className={cn("p-2 rounded-md hover:bg-[#1f1f23] transition-colors", editor?.isActive('bulletList') && "bg-indigo-600/20 text-indigo-400")}
                    >
                        <List className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                        className={cn("p-2 rounded-md hover:bg-[#1f1f23] transition-colors", editor?.isActive('orderedList') && "bg-indigo-600/20 text-indigo-400")}
                    >
                        <ListOrdered className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => editor?.chain().focus().toggleBlockquote().run()}
                        className={cn("p-2 rounded-md hover:bg-[#1f1f23] transition-colors", editor?.isActive('blockquote') && "bg-indigo-600/20 text-indigo-400")}
                    >
                        <Quote className="w-4 h-4" />
                    </button>
                    <div className="w-[1px] h-6 bg-[#26262b] mx-1" />
                    <button
                        onClick={() => editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
                        className="p-2 rounded-md hover:bg-[#1f1f23] transition-colors"
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

            {/* Editor Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="max-w-3xl mx-auto py-12 px-8">
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
