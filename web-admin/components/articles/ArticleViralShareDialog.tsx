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
import { generateArticleFOMOContent } from '@/lib/articleViralTemplates';

interface ArticleViralShareDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    formData: any;
    examTitle?: string;
    examShortTitle?: string;
}

export default function ArticleViralShareDialog({
    isOpen,
    onOpenChange,
    formData,
    examTitle,
    examShortTitle
}: ArticleViralShareDialogProps) {
    const [editedMessage, setEditedMessage] = useState('');

    useEffect(() => {
        if (isOpen) {
            setEditedMessage(generateArticleFOMOContent({
                title: formData.title,
                category: formData.category,
                slug: formData.slug || '',
                examTitle,
                examShortTitle
            }));
        }
    }, [isOpen, formData, examTitle, examShortTitle]);

    const handleCopy = () => {
        navigator.clipboard.writeText(editedMessage);
        toast.success('Viral article alert copied!');
        onOpenChange(false);
    };

    const handleShare = (platform: 'wa' | 'tg') => {
        const text = encodeURIComponent(editedMessage);
        if (platform === 'wa') {
            window.open(`https://wa.me/?text=${text}`, '_blank');
        } else {
            const url = encodeURIComponent(`https://examsuchana.in/${formData.slug}`);
            window.open(`https://t.me/share/url?url=${url}&text=${text}`, '_blank');
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Share2 className="h-5 w-5 text-indigo-600" />
                        Viral Article Strategy
                    </DialogTitle>
                    <DialogDescription>
                        Generate a specialized alert for this article. Perfect for study groups.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                Social Message (Editable)
                            </Label>
                            <Badge variant="secondary" className="text-[10px]">
                                {formData.category} TEMPLATE
                            </Badge>
                        </div>
                        <Textarea 
                            value={editedMessage}
                            onChange={(e) => setEditedMessage(e.target.value)}
                            className="min-h-[250px] font-mono text-sm bg-indigo-50/30 border-indigo-100 focus-visible:ring-indigo-500"
                            placeholder="Craft your viral article alert here..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Button 
                            type="button"
                            className="bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold" 
                            onClick={() => handleShare('wa')}
                        >
                            <MessageSquare className="mr-2 h-4 w-4" />
                            WhatsApp Hub Viral
                        </Button>
                        <Button 
                            type="button"
                            className="bg-[#0088cc] hover:bg-[#0077b3] text-white font-bold"
                            onClick={() => handleShare('tg')}
                        >
                            <Send className="mr-2 h-4 w-4" />
                            Telegram Hub Viral
                        </Button>
                    </div>
                </div>

                <DialogFooter className="sm:justify-between items-center">
                    <div className="text-[10px] text-muted-foreground italic">
                        The Intelligence Hub thrives on sharing deep-detail articles.
                    </div>
                    <div className="flex gap-2">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button 
                            type="button"
                            className="bg-indigo-600 hover:bg-indigo-700"
                            onClick={handleCopy}
                        >
                            <Copy className="mr-2 h-4 w-4" /> 
                            Copy & Distribute
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
