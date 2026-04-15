'use client';

import React, { useState, useEffect, useRef } from 'react';
import { RefreshCw, Check, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { examService, Exam } from '@/lib/api';

interface ExamLinkProps {
    /** Pre-populated exam ID (e.g. from saved article) */
    initialExamId?: string | null;
    /** Pre-populated exam slug used to reconstruct the URL in the input */
    initialSlug?: string | null;
    /** Called whenever the resolved examId changes (null = cleared / invalid) */
    onExamResolved: (examId: string | null) => void;
}

/**
 * ExamLink — Standalone exam-URL input with debounced slug/id resolution.
 *
 * Encapsulates:
 *  - local URL input state
 *  - debounced validation (600 ms)
 *  - slug/id lookup via examService
 *  - status feedback UI (validating / linked / error / hint)
 */
export default function ExamLink({ initialExamId, initialSlug, onExamResolved }: ExamLinkProps) {
    const [urlInput, setUrlInput] = useState<string>(() =>
        initialSlug ? `https://examsuchana.in/exam/${initialSlug}` : ''
    );
    const [resolvedExam, setResolvedExam] = useState<Exam | null>(null);
    const [isValidating, setIsValidating] = useState(false);
    const [validationError, setValidationError] = useState('');

    // Track whether we've seeded the initial exam to avoid redundant fetches
    const seededRef = useRef(false);

    // Seed resolvedExam from initialExamId on first mount
    useEffect(() => {
        if (!initialExamId || seededRef.current) return;
        seededRef.current = true;
        examService.getExamById(initialExamId).then((res) => {
            if (res?.success && res.data) {
                setResolvedExam(res.data);
                setUrlInput((prev) =>
                    prev || `https://examsuchana.in/exam/${res.data.slug}`
                );
            }
        }).catch(() => { /* silently ignore seed failure */ });
    }, [initialExamId]);

    // Debounced validation whenever the user edits the input
    useEffect(() => {
        if (!urlInput) {
            setResolvedExam(null);
            setValidationError('');
            onExamResolved(null);
            return;
        }

        const timer = setTimeout(async () => {
            // Parse slug from URL or bare string
            let slug = urlInput.trim();
            try {
                const parsed = new URL(slug);
                const parts = parsed.pathname.split('/').filter(Boolean);
                slug = parts[parts.length - 1];
            } catch {
                const parts = slug.split('/').filter(Boolean);
                slug = parts[parts.length - 1] || slug;
            }

            setIsValidating(true);
            setValidationError('');
            try {
                // Try slug first, then id
                const bySlug = await examService.getExamBySlug(slug);
                if (bySlug?.success && bySlug.data) {
                    setResolvedExam(bySlug.data);
                    onExamResolved(bySlug.data.id);
                    return;
                }

                const byId = await examService.getExamById(slug).catch(() => null);
                if (byId?.success && byId.data) {
                    setResolvedExam(byId.data);
                    onExamResolved(byId.data.id);
                    return;
                }

                throw new Error('not found');
            } catch {
                setResolvedExam(null);
                onExamResolved(null);
                setValidationError('No matching exam found for this link.');
            } finally {
                setIsValidating(false);
            }
        }, 600);

        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [urlInput]);

    return (
        <div className="space-y-2">
            <Label htmlFor="examUrl">Linked Exam (URL)</Label>
            <div className="relative">
                <Input
                    id="examUrl"
                    placeholder="https://examsuchana.in/exam/upsc-cse"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    className={
                        resolvedExam
                            ? 'pr-8 border-emerald-400 focus-visible:ring-emerald-300'
                            : validationError && urlInput
                            ? 'pr-8 border-destructive focus-visible:ring-destructive/30'
                            : ''
                    }
                />
                {/* Clear button */}
                {urlInput && !isValidating && (
                    <button
                        type="button"
                        onClick={() => setUrlInput('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        aria-label="Clear exam link"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                )}
            </div>

            {/* Status feedback */}
            {isValidating ? (
                <p className="text-xs text-blue-500 font-medium flex items-center gap-1">
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    Validating Exam Link…
                </p>
            ) : resolvedExam ? (
                <p className="text-xs text-emerald-600 font-medium flex items-center gap-1 break-all">
                    <Check className="w-3 h-3 flex-shrink-0" />
                    Linked: {resolvedExam.title}
                </p>
            ) : validationError && urlInput ? (
                <p className="text-xs text-destructive flex items-center gap-1">
                    <X className="w-3 h-3 flex-shrink-0" />
                    {validationError}
                </p>
            ) : (
                <p className="text-xs text-muted-foreground">
                    Paste exam link to bind this article.
                </p>
            )}
        </div>
    );
}
