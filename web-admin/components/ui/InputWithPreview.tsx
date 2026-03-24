'use client';

import { cn } from '@/lib/utils';
import { Eye, Maximize2, Type, Upload } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import TextareaAutosize from 'react-textarea-autosize';

interface InputWithPreviewProps {
    label: string;
    value: string | null | undefined;
    onChange: (val: string) => void;
    placeholder?: string;
    disabled?: boolean;
    icon?: any;
    className?: string;
    minHeight?: string;
}

export function InputWithPreview({
    label,
    value,
    onChange,
    placeholder,
    disabled,
    icon: Icon,
    className,
    minHeight = "120px"
}: InputWithPreviewProps) {
    return (
        <div className={cn("grid grid-cols-1 md:grid-cols-4 lg:grid-cols-12 gap-4 md:gap-8 items-start group/row border-b border-gray-50 pb-6 last:border-0", className)}>
            <div className="md:col-span-1 lg:col-span-3 pt-2">
                <label className="text-[11px] font-black text-gray-400 uppercase flex items-center gap-2 group-hover/row:text-primary transition-colors">
                    {Icon && <Icon className="w-3.5 h-3.5" />}
                    {label}
                </label>
                {!disabled && (
                    <p className="text-[9px] text-gray-300 font-bold uppercase mt-2 opacity-0 group-hover/row:opacity-100 transition-all">Editable Area</p>
                )}
            </div>

            <div className="md:col-span-3 lg:col-span-9 grid grid-cols-1 xl:grid-cols-2 gap-4">
                <div className="relative h-full flex flex-col">
                    <TextareaAutosize
                        disabled={disabled}
                        value={value ?? ""}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={placeholder}
                        minRows={4}
                        className={cn(
                            "w-full rounded-xl py-3 px-4 outline-none transition-all text-sm font-medium resize-none flex-1",
                            disabled
                                ? "bg-gray-50/30 border-transparent text-gray-600 cursor-not-allowed"
                                : "bg-white border border-gray-100 focus:border-primary border-primary/10 text-gray-900 group-hover/row:border-primary/30"
                        )}
                    />
                    {!disabled && (
                        <div className="absolute bottom-4 right-4 flex items-center gap-2 opacity-0 group-hover/row:opacity-100 transition-all">
                            <button className="p-1.5 hover:bg-gray-100 rounded text-gray-400 hover:text-primary transition-colors">
                                <Maximize2 className="w-3" />
                            </button>
                            <button className="p-2 bg-primary text-black rounded-lg shadow-lg hover:brightness-95 transition-all">
                                <Upload className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>

                <div
                    style={{ minHeight: minHeight }}
                    className={cn(
                        "rounded-xl p-5 overflow-y-auto transition-all bg-white relative",
                        disabled ? "bg-gray-50/50 border border-gray-50" : "bg-gray-50/80 border border-primary/5 shadow-inner"
                    )}
                >
                    <div className="text-[10px] font-bold text-gray-300 uppercase mb-4 flex items-center gap-2">
                        <Eye className="w-3 h-3" />
                        Preview
                    </div>
                    {value ? (
                        <div className="prose prose-sm max-w-none prose-table:border-collapse prose-table:w-full prose-td:border prose-td:border-gray-200 prose-td:p-2 prose-th:border prose-th:border-gray-200 prose-th:p-2 prose-th:bg-gray-50 text-gray-700 font-medium leading-relaxed">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {value}
                            </ReactMarkdown>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-200 gap-2 py-4">
                            <Type className="w-6 h-6 opacity-10" />
                            <p className="text-[9px] font-black uppercase opacity-30">No Content</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
