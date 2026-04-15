'use client';

import React from 'react';
import { Plus, Trash2, GripVertical, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

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

    const addFAQ = () => {
        onChange([...safeFaqs, { question: '', answer: '' }]);
    };

    const removeFAQ = (index: number) => {
        const newFaqs = [...safeFaqs];
        newFaqs.splice(index, 1);
        onChange(newFaqs);
    };

    const updateFAQ = (index: number, field: keyof FAQItem, value: string) => {
        const newFaqs = [...safeFaqs];
        newFaqs[index] = { ...newFaqs[index], [field]: value };
        onChange(newFaqs);
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
                    {safeFaqs.map((faq, index) => (
                        <Card key={index} className="overflow-hidden border-none shadow-sm ring-1 ring-border group transition-all duration-200 focus-within:ring-primary/40 focus-within:shadow-md">
                            <CardContent className="p-4 space-y-3 relative">
                                <div className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab">
                                    <GripVertical className="w-4 h-4 text-muted-foreground/40" />
                                </div>
                                <div className="pl-4 space-y-3">
                                    <div className="flex items-start gap-4">
                                        <div className="flex-1 space-y-1.5">
                                            <Label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Question {index + 1}</Label>
                                            <Input
                                                placeholder="e.g. When is the exam date?"
                                                value={faq.question}
                                                onChange={(e) => updateFAQ(index, 'question', e.target.value)}
                                                className="h-9 text-sm rounded-lg border-slate-200 bg-slate-50/50 focus:bg-white transition-all"
                                            />
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeFAQ(index)}
                                            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 mt-6"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Answer</Label>
                                        <Textarea
                                            placeholder="Provide a clear, concise answer..."
                                            value={faq.answer}
                                            onChange={(e) => updateFAQ(index, 'answer', e.target.value)}
                                            className="min-h-[80px] text-sm rounded-lg border-slate-200 bg-slate-50/50 focus:bg-white transition-all resize-none"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
