'use client';

import React, { useState } from 'react';
import { Plus, Trash2, GripVertical, MessageSquare, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface FAQItem {
    question: string;
    answer: string;
}

interface FAQEditorProps {
    faqs: FAQItem[];
    onChange: (faqs: FAQItem[]) => void;
}

export default function FAQEditor({ faqs, onChange }: FAQEditorProps) {
    const safeFaqs = Array.isArray(faqs) ? faqs : [];
    const [expandedIndices, setExpandedIndices] = useState<number[]>([0]);

    const addFAQ = () => {
        const newIndex = safeFaqs.length;
        onChange([...safeFaqs, { question: '', answer: '' }]);
        setExpandedIndices(prev => [...prev, newIndex]);
    };

    const removeFAQ = (index: number) => {
        const newFaqs = [...safeFaqs];
        newFaqs.splice(index, 1);
        onChange(newFaqs);
        setExpandedIndices(prev => prev.filter(i => i !== index).map(i => i > index ? i - 1 : i));
    };

    const updateFAQ = (index: number, field: keyof FAQItem, value: string) => {
        const newFaqs = [...safeFaqs];
        newFaqs[index] = { ...newFaqs[index], [field]: value };
        onChange(newFaqs);
    };

    const toggleExpand = (index: number) => {
        setExpandedIndices(prev =>
            prev.includes(index)
                ? prev.filter(i => i !== index)
                : [...prev, index]
        );
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-semibold">Frequently Asked Questions</h3>
                </div>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addFAQ}
                    className="h-8 gap-1.5 text-xs bg-primary/5 border-primary/20 text-primary hover:bg-primary/10 hover:text-primary transition-colors"
                >
                    <Plus className="w-3.5 h-3.5" />
                    Add FAQ
                </Button>
            </div>

            {safeFaqs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 rounded-xl border border-dashed border-muted-foreground/20 bg-muted/5">
                    <p className="text-xs text-muted-foreground italic text-center">
                        No FAQs added yet.<br />
                        Adding FAQs improves SEO and helps users.
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {safeFaqs.map((faq, index) => {
                        const isExpanded = expandedIndices.includes(index);
                        return (
                            <Card key={index} className="overflow-hidden border-none shadow-sm ring-1 ring-border group transition-all duration-200 focus-within:ring-primary/40 focus-within:shadow-md">
                                <div 
                                    className={cn(
                                        "flex items-center gap-3 p-3 cursor-pointer select-none transition-colors",
                                        isExpanded ? "bg-primary/5 border-b border-border/50" : "hover:bg-slate-50"
                                    )}
                                    onClick={() => toggleExpand(index)}
                                >
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                        <GripVertical className="w-4 h-4 text-muted-foreground/30 flex-shrink-0" />
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                                FAQ {index + 1}
                                            </span>
                                            <span className="text-sm font-medium truncate text-slate-700">
                                                {faq.question || <span className="text-muted-foreground/50 italic font-normal">New Question</span>}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-1">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                removeFAQ(index);
                                            }}
                                            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                        <motion.div
                                            animate={{ rotate: isExpanded ? 180 : 0 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <ChevronDown className="w-4 h-4 text-muted-foreground/60" />
                                        </motion.div>
                                    </div>
                                </div>

                                <AnimatePresence initial={false}>
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.2, ease: "easeInOut" }}
                                        >
                                            <CardContent className="p-4 pt-0 space-y-4 bg-white">
                                                <div className="pt-4 space-y-4">
                                                    <div className="space-y-1.5">
                                                        <Label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Question</Label>
                                                        <Input
                                                            placeholder="e.g. When is the exam date?"
                                                            value={faq.question}
                                                            onChange={(e) => updateFAQ(index, 'question', e.target.value)}
                                                            className="h-9 text-sm rounded-lg border-slate-200 bg-slate-50/50 focus:bg-white transition-all"
                                                            onClick={(e) => e.stopPropagation()}
                                                        />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <Label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Answer</Label>
                                                        <Textarea
                                                            placeholder="Provide a clear, concise answer..."
                                                            value={faq.answer}
                                                            onChange={(e) => updateFAQ(index, 'answer', e.target.value)}
                                                            className="min-h-[100px] text-sm rounded-lg border-slate-200 bg-slate-50/50 focus:bg-white transition-all resize-none"
                                                            onClick={(e) => e.stopPropagation()}
                                                        />
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
