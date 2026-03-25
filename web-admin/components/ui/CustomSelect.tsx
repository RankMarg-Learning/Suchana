'use client';

import { cn } from '@/lib/utils';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Label } from './label';

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
    const normalizedOptions = options.map(opt =>
        typeof opt === 'string' ? { label: opt.replace(/_/g, ' '), value: opt } : opt
    );

    return (
        <div className="space-y-1.5 w-full">
            {label && (
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">
                    {label}
                </Label>
            )}

            <Select
                value={value}
                onValueChange={onChange}
                disabled={disabled}
            >
                <SelectTrigger className={cn(
                    "w-full h-10 px-4 bg-white border-gray-100 rounded-xl focus:ring-primary/5 transition-all font-bold text-xs ring-offset-0",
                    className
                )}>
                    <SelectValue placeholder={placeholder || 'Select option...'} />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-gray-100 shadow-2xl p-1 animate-in fade-in-0 zoom-in-95 duration-200">
                    <SelectGroup>
                        {normalizedOptions.map((opt) => (
                            <SelectItem
                                key={opt.value}
                                value={opt.value}
                                className="rounded-lg py-2.5 px-4 text-[10px] font-black uppercase tracking-widest focus:bg-primary/5 focus:text-primary transition-colors cursor-pointer"
                            >
                                {opt.label}
                            </SelectItem>
                        ))}
                    </SelectGroup>
                </SelectContent>
            </Select>
        </div>
    );
}
