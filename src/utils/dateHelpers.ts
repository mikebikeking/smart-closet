// Native date helpers (no external dependencies)

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const parseDate = (dateString: string): Date => {
  try {
    return new Date(dateString);
  } catch {
    return new Date();
  }
};

export const formatDate = (dateString: string): string => {
  try {
    const date = parseDate(dateString);
    if (isNaN(date.getTime())) return dateString;
    
    const month = MONTHS[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
    return `${month} ${day}, ${year}`;
  } catch {
    return dateString;
  }
};

export const formatDateShort = (dateString: string): string => {
  try {
    const date = parseDate(dateString);
    if (isNaN(date.getTime())) return dateString;
    
    const month = MONTHS[date.getMonth()];
    const day = date.getDate();
    return `${month} ${day}`;
  } catch {
    return dateString;
  }
};

export const daysBetween = (startDate: string, endDate: string): number => {
  try {
    const start = parseDate(startDate);
    const end = parseDate(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
    
    const diffTime = end.getTime() - start.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  } catch {
    return 0;
  }
};

export const daysSince = (dateString: string): number => {
  try {
    const date = parseDate(dateString);
    if (isNaN(date.getTime())) return 0;
    
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  } catch {
    return 0;
  }
};

export const getTodayISO = (): string => {
  return new Date().toISOString();
};
