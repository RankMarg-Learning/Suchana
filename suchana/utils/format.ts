export function cleanLabel(str: string | null | undefined): string {
  if (!str) return '';
  if (typeof str !== 'string') return String(str);

  const acronyms = [
    'SSC', 'UPSC', 'PSC', 'IIT', 'JEE', 'NEET', 'GATE', 'CAT',
    'IAS', 'IPS', 'NDA', 'CDS', 'RRB', 'IBPS', 'SBI', 'RBI',
    'BCA', 'MCA', 'ITI', 'MBBS', 'BVA', 'BFA'
  ];

  return str
    .replace(/_/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map(word => {
      const upperWord = word.toUpperCase();
      if (acronyms.includes(upperWord)) return upperWord;
      if (word.length === 0) return '';
      return word.charAt(0).toUpperCase() + word.slice(1).toUpperCase();
    })
    .join(' ');
}

export function formatDate(dateStr: string | null | undefined, includeTime: boolean = false): string {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;

    // Check if it's just a date without time, only include if explicit includeTime is true
    const hasTime = includeTime && (dateStr.includes('T') || dateStr.includes(':'));

    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      ...(hasTime ? { hour: '2-digit', minute: '2-digit' } : {})
    });
  } catch {
    return dateStr;
  }
}

/**
 * Replaces ISO dates in a text string with readable formats
 * Matches formats like: 2026-03-20T14:30:00Z or 2026-03-20
 */
export function formatDatesInText(text: string | null | undefined, includeTime: boolean = false): string {
  if (!text) return '';
  const dateRegex = /\b\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}(:?\d{2})?))?\b/g;
  return text.replace(dateRegex, (match) => formatDate(match, includeTime));
}

export function formatRelativeDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const now = new Date();
    const diffMs = Math.max(0, now.getTime() - date.getTime());
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  } catch (e) {
    return 'Recently';
  }
}
