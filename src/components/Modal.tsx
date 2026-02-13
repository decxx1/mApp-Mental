import React, { useEffect, useRef, useState } from 'react';
import { useModalStore } from '../store/useModalStore';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, HelpCircle, Info } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const Modal: React.FC = () => {
    const { isOpen, options, closeModal } = useModalStore();
    const [inputValue, setInputValue] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen && options?.type === 'prompt') {
            setInputValue(options.defaultValue || '');
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen, options]);

    if (!options) return null;

    const handleConfirm = () => {
        options.onConfirm(inputValue);
        setInputValue('');
    };

    const handleCancel = () => {
        if (options.onCancel) options.onCancel();
        else closeModal();
        setInputValue('');
    };

    const Icon = options.type === 'prompt' ? HelpCircle :
        options.type === 'confirm' ? AlertCircle : Info;

    const iconColor = options.type === 'confirm' ? 'text-red-400' : 'text-violet-400';

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleCancel}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal Container */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="relative w-full max-w-md bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden"
                    >
                        <div className="p-6">
                            <div className="flex items-start gap-4">
                                <div className={cn("mt-1 p-2 rounded-xl bg-border-subtle border border-border", iconColor)}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-lg font-bold text-white tracking-tight">{options.title}</h3>
                                    <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
                                        {options.message}
                                    </p>

                                    {options.type === 'prompt' && (
                                        <div className="mt-4">
                                            <input
                                                ref={inputRef}
                                                type="text"
                                                value={inputValue}
                                                onChange={(e) => setInputValue(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') handleConfirm();
                                                    if (e.key === 'Escape') handleCancel();
                                                }}
                                                placeholder={options.placeholder}
                                                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
                                            />
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={handleCancel}
                                    className="p-1 text-zinc-500 hover:text-white transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="px-6 py-4 bg-background/50 border-t border-border flex items-center justify-end gap-3">
                            {options.type !== 'alert' && (
                                <button
                                    onClick={handleCancel}
                                    className="px-4 py-2 rounded-xl text-sm font-medium text-zinc-400 hover:text-white hover:bg-surface-hover transition-all"
                                >
                                    {options.cancelLabel || 'Cancelar'}
                                </button>
                            )}
                            <button
                                onClick={handleConfirm}
                                className={cn(
                                    "px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-lg",
                                    options.type === 'confirm'
                                        ? "bg-destructive hover:bg-destructive-hover text-destructive-foreground shadow-destructive/40"
                                        : "bg-primary hover:bg-primary-hover text-primary-foreground shadow-primary/40"
                                )}
                            >
                                {options.confirmLabel || (options.type === 'alert' ? 'Entendido' : 'Confirmar')}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
