import { CelebrationItem } from '../types';

export const MONTH_NAMES_ES = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
];

export const MONTH_SHORT_ES = [
  'Ene',
  'Feb',
  'Mar',
  'Abr',
  'May',
  'Jun',
  'Jul',
  'Ago',
  'Sep',
  'Oct',
  'Nov',
  'Dic',
];

export interface UpcomingCelebrationInfo {
  day: number;
  month: number;
  daysUntil: number;
  isToday: boolean;
  isTomorrow: boolean;
  isThisWeek: boolean;
  relativeLabel: string;
  badgeColor: string;
  nextDate: Date;
}

/**
 * Parses diverse date strings into { day, month } (1-indexed month)
 * Supports: "18 de Agosto", "18 Agosto", "18/08", "18-08-1990", "2026-08-18", etc.
 */
export function parseCelebrationDate(dateStr: string): { day: number; month: number } | null {
  if (!dateStr) return null;
  const str = dateStr.toLowerCase().trim();

  // Pattern 1: "18 de Agosto" or "18 Agosto"
  const textMatch = str.match(/(\d{1,2})\s+(?:de\s+)?([a-záéíóúñ]+)/i);
  if (textMatch) {
    const day = parseInt(textMatch[1], 10);
    const monthText = textMatch[2].normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const monthIndex = MONTH_NAMES_ES.findIndex((m) =>
      m.startsWith(monthText.slice(0, 3))
    );
    if (monthIndex !== -1 && day >= 1 && day <= 31) {
      return { day, month: monthIndex + 1 };
    }
  }

  // Pattern 2: "18/08" or "18-08" or "18/08/1995"
  const slashMatch = str.match(/(\d{1,2})[\/\-\.](\d{1,2})/);
  if (slashMatch) {
    const p1 = parseInt(slashMatch[1], 10);
    const p2 = parseInt(slashMatch[2], 10);
    // If p1 > 12, p1 is day and p2 is month
    if (p1 >= 1 && p1 <= 31 && p2 >= 1 && p2 <= 12) {
      return { day: p1, month: p2 };
    }
  }

  // Pattern 3: "2026-08-18" ISO format
  const isoMatch = str.match(/\d{4}-(\d{2})-(\d{2})/);
  if (isoMatch) {
    const month = parseInt(isoMatch[1], 10);
    const day = parseInt(isoMatch[2], 10);
    if (day >= 1 && day <= 31 && month >= 1 && month <= 12) {
      return { day, month };
    }
  }

  return null;
}

/**
 * Calculates countdown and status from reference date
 */
export function getCelebrationCountdown(
  dateStr: string,
  referenceDate = new Date()
): UpcomingCelebrationInfo | null {
  const parsed = parseCelebrationDate(dateStr);
  if (!parsed) return null;

  const currentYear = referenceDate.getFullYear();
  const currentMonth = referenceDate.getMonth(); // 0-indexed
  const currentDay = referenceDate.getDate();

  const todayMidnight = new Date(currentYear, currentMonth, currentDay);
  
  let targetDate = new Date(currentYear, parsed.month - 1, parsed.day);
  if (targetDate < todayMidnight) {
    // If the birthday already passed this year, the next one is next year
    targetDate = new Date(currentYear + 1, parsed.month - 1, parsed.day);
  }

  const diffTime = targetDate.getTime() - todayMidnight.getTime();
  const daysUntil = Math.round(diffTime / (1000 * 60 * 60 * 24));

  const isToday = daysUntil === 0;
  const isTomorrow = daysUntil === 1;
  const isThisWeek = daysUntil <= 7;

  let relativeLabel = '';
  let badgeColor = '';

  if (isToday) {
    relativeLabel = '¡Es hoy! 🎂';
    badgeColor = 'bg-rose-500 text-white animate-pulse';
  } else if (isTomorrow) {
    relativeLabel = '¡Mañana! 🎉';
    badgeColor = 'bg-amber-500 text-white';
  } else if (daysUntil <= 7) {
    relativeLabel = `En ${daysUntil} días`;
    badgeColor = 'bg-teal-700 text-white';
  } else if (daysUntil <= 30) {
    relativeLabel = `En ${daysUntil} días`;
    badgeColor = 'bg-slate-100 text-slate-700 border border-slate-200';
  } else {
    relativeLabel = `En ${daysUntil} días`;
    badgeColor = 'bg-slate-100 text-slate-600';
  }

  return {
    day: parsed.day,
    month: parsed.month,
    daysUntil,
    isToday,
    isTomorrow,
    isThisWeek,
    relativeLabel,
    badgeColor,
    nextDate: targetDate,
  };
}

export interface EnrichedCelebration {
  item: CelebrationItem;
  countdown: UpcomingCelebrationInfo | null;
}

/**
 * Returns sorted list of birthdays with their upcoming calculation
 */
export function getSortedUpcomingBirthdays(
  celebrations: CelebrationItem[],
  referenceDate = new Date()
): {
  closestBirthday: EnrichedCelebration | null;
  upcomingList: EnrichedCelebration[];
  allEnriched: EnrichedCelebration[];
} {
  const birthdays = celebrations.filter((c) => c.type === 'birthday');

  const enriched: EnrichedCelebration[] = birthdays.map((item) => ({
    item,
    countdown: getCelebrationCountdown(item.date, referenceDate),
  }));

  // Sort by daysUntil ascending (items without valid countdown pushed to end)
  enriched.sort((a, b) => {
    const daysA = a.countdown ? a.countdown.daysUntil : 999;
    const daysB = b.countdown ? b.countdown.daysUntil : 999;
    return daysA - daysB;
  });

  const validEnriched = enriched.filter((e) => e.countdown !== null);
  const closestBirthday = validEnriched.length > 0 ? validEnriched[0] : null;
  // Upcoming in next 45 days (excluding the primary one if shown separately)
  const upcomingList = validEnriched.slice(1, 5);

  return {
    closestBirthday,
    upcomingList,
    allEnriched: enriched,
  };
}
