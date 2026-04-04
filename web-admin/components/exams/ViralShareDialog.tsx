'use client';

import { useState, useEffect } from 'react';
import { Share2, MessageSquare, Send, Copy } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from 'sonner';
import { generateFOMOContent } from '@/lib/viralTemplates';

interface ViralShareDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    formData: any;
    initialData?: any;
}

export default function ViralShareDialog({
    isOpen,
    onOpenChange,
    formData,
    initialData
}: ViralShareDialogProps) {
    const [editedMessage, setEditedMessage] = useState('');

    useEffect(() => {
        if (isOpen) {
            setEditedMessage(generateFOMOContent({
                title: formData.title,
                shortTitle: formData.shortTitle,
                body: formData.conductingBody,
                vacancies: formData.totalVacancies,
                status: formData.status,
                slug: initialData?.slug || initialData?.data?.slug || '',
                category: formData.category,
                lifecycleEvents: initialData?.lifecycleEvents || initialData?.data?.lifecycleEvents || []
            }));
        }
    }, [isOpen, formData, initialData]);

    const handleCopy = () => {
        navigator.clipboard.writeText(editedMessage);
        toast.success('Viral alert copied to clipboard!');
        onOpenChange(false);
    };

    const handleShare = (platform: 'wa' | 'tg') => {
        const text = encodeURIComponent(editedMessage);
        if (platform === 'wa') {
            window.open(`https://wa.me/?text=${text}`, '_blank');
        } else {
            const url = encodeURIComponent(`https://examsuchana.in/exam/${initialData?.slug || initialData?.data?.slug}`);
            window.open(`https://t.me/share/url?url=${url}&text=${text}`, '_blank');
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Share2 className="h-5 w-5 text-blue-600" />
                        Viral Share Strategy
                    </DialogTitle>
                    <DialogDescription>
                        Generate a status-aware FOMO message. Edit below before sharing.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                Message Preview (Editable)
                            </Label>
                            <Badge variant="secondary" className="text-[10px]">
                                {formData.status} TEMPLATE
                            </Badge>
                        </div>
                        <Textarea 
                            value={editedMessage}
                            onChange={(e) => setEditedMessage(e.target.value)}
                            className="min-h-[250px] font-mono text-sm bg-slate-50 border-blue-100 focus-visible:ring-blue-500"
                            placeholder="Craft your viral alert here..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Button 
                            type="button"
                            className="bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold" 
                            onClick={() => handleShare('wa')}
                        >
                            <MessageSquare className="mr-2 h-4 w-4" />
                            WhatsApp Viral
                        </Button>
                        <Button 
                            type="button"
                            className="bg-[#0088cc] hover:bg-[#0077b3] text-white font-bold"
                            onClick={() => handleShare('tg')}
                        >
                            <Send className="mr-2 h-4 w-4" />
                            Telegram Viral
                        </Button>
                    </div>
                </div>

                <DialogFooter className="sm:justify-between items-center">
                    <div className="text-[10px] text-muted-foreground">
                        Tip: Edit the text to add recruitment-specific insights.
                    </div>
                    <div className="flex gap-2">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button 
                            type="button"
                            className="bg-blue-600 hover:bg-blue-700"
                            onClick={handleCopy}
                        >
                            <Copy className="mr-2 h-4 w-4" /> 
                            Copy & Finish
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
