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
    .map(word => {
      const upperWord = word.toUpperCase();
      if (acronyms.includes(upperWord)) return upperWord;
      if (word.length === 0) return '';
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
}
