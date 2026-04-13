import { format } from "date-fns";
import React from 'react';

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return 'TBA';
  try {
    return format(new Date(date), 'dd MMM yyyy');
  } catch {
    return 'Invalid Date';
  }
}

export function formatDatesInText(text: string | null | undefined, includeTime: boolean = false): string {
  if (!text) return '';
  const dateRegex = /\b\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}(:?\d{2})?))?\b/g;
  return text.replace(dateRegex, (match) => formatDate(match));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function generateHeadingId(children: React.ReactNode): string {
  const text = typeof children === 'string'
    ? children
    : React.Children.toArray(children)
      .map(child => (typeof child === 'string' || typeof child === 'number' ? child : ''))
      .join('');
  return slugify(text);
}
