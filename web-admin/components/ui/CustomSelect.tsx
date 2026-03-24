'use client';

import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface SelectProps {
    value: string;
    onChange: (val: string) => void;
    options: string[] | { label: string, value: string }[];
    placeholder?: string;
    disabled?: boolean;
    label?: string;
    className?: string;
}

export function CustomSelect({ value, onChange, options, placeholder, disabled, label, className }: SelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const normalizedOptions = options.map(opt => 
        typeof opt === 'string' ? { label: opt.replace(/_/g, ' '), value: opt } : opt
    );

    const activeOption = normalizedOptions.find(opt => opt.value === value);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="space-y-2 relative" ref={containerRef}>
            {label && <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">{label}</label>}
            <button
                type="button"
                disabled={disabled}
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "w-full bg-white border border-gray-200 rounded-lg py-3 px-4 flex items-center justify-between outline-none transition-all text-sm font-bold shadow-sm hover:border-primary disabled:opacity-50",
                    isOpen && "border-primary ring-2 ring-primary/10"
                )}
            >
                <span className={cn(!activeOption && "text-gray-400")}>
                    {activeOption ? activeOption.label : placeholder || 'Select option...'}
                </span>
                <ChevronDown className={cn("w-4 h-4 text-gray-400 transition-transform", isOpen && "rotate-180")} />
            </button>

            {isOpen && !disabled && (
                <div className="absolute z-50 top-full mt-2 w-full bg-white border border-gray-100 rounded-xl shadow-2xl py-2 animate-in fade-in zoom-in-95 duration-200">
                    <div className="max-h-[240px] overflow-y-auto">
                        {normalizedOptions.map((opt) => (
                            <button
                                key={opt.value}
                                onClick={() => {
                                    onChange(opt.value);
                                    setIsOpen(false);
                                }}
                                className={cn(
                                    "w-full text-left px-4 py-2.5 text-xs font-bold uppercase tracking-widest hover:bg-gray-50 transition-colors",
                                    value === opt.value ? "text-primary bg-primary/5" : "text-gray-600"
                                )}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
