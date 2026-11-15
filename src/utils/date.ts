const WEEKDAYS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
const WEEKDAYS_SHORT = ['一', '二', '三', '四', '五', '六', '日'];

function pad(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}

export function toISO(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function parseISO(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function todayISO(): string {
  return toISO(new Date());
}

export function addDays(iso: string, delta: number): string {
  const date = parseISO(iso);
  date.setDate(date.getDate() + delta);
  return toISO(date);
}

export function startOfWeek(iso = todayISO()): string {
  const date = parseISO(iso);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  return toISO(date);
}

export function endOfWeek(iso = todayISO()): string {
  return addDays(startOfWeek(iso), 6);
}

export function weekdayIndex(iso: string): number {
  const day = parseISO(iso).getDay();
  return day === 0 ? 6 : day - 1;
}

export function weekdayCN(iso: string): string {
  return WEEKDAYS[weekdayIndex(iso)];
}

export function weekdayShort(iso: string): string {
  return WEEKDAYS_SHORT[weekdayIndex(iso)];
}

export function formatDateCN(iso: string): string {
  const date = parseISO(iso);
  return `${date.getMonth() + 1} 月 ${date.getDate()} 日 ${WEEKDAYS[weekdayIndex(iso)]}`;
}

export function formatShort(iso: string): string {
  const date = parseISO(iso);
  return `${date.getMonth() + 1}.${date.getDate()}`;
}

export function formatMonthDay(iso: string): string {
  const date = parseISO(iso);
  return `${date.getMonth() + 1} 月 ${date.getDate()} 日`;
}

export function daysBetween(from: string, to: string): number {
  const a = parseISO(from).getTime();
  const b = parseISO(to).getTime();
  return Math.round((b - a) / 86400000);
}

export function eachDay(startIso: string, endIso: string): string[] {
  const days: string[] = [];
  let cursor = startIso;
  let guard = 0;
  while (cursor <= endIso && guard < 400) {
    days.push(cursor);
    cursor = addDays(cursor, 1);
    guard += 1;
  }
  return days;
}

export function lastNDates(count: number, endIso = todayISO()): string[] {
  const dates: string[] = [];
  for (let i = count - 1; i >= 0; i -= 1) {
    dates.push(addDays(endIso, -i));
  }
  return dates;
}

export function relativeTime(isoDateTime: string): string {
  const then = new Date(isoDateTime).getTime();
  const now = Date.now();
  const diffMin = Math.max(0, Math.floor((now - then) / 60000));
  if (diffMin < 1) return '刚刚';
  if (diffMin < 60) return `${diffMin} 分钟前`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} 小时前`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 7) return `${diffDay} 天前`;
  return formatShort(isoDateTime.slice(0, 10));
}

export function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 6) return '夜深了';
  if (hour < 11) return '早上好';
  if (hour < 14) return '中午好';
  if (hour < 18) return '下午好';
  return '晚上好';
}

function toLocalISOString(date: Date): string {
  const offsetMinutes = -date.getTimezoneOffset();
  const sign = offsetMinutes >= 0 ? '+' : '-';
  const absolute = Math.abs(offsetMinutes);
  const offsetHours = pad(Math.floor(absolute / 60));
  const offsetRest = pad(absolute % 60);
  const milliseconds = String(date.getMilliseconds()).padStart(3, '0');
  return `${toISO(date)}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(
    date.getSeconds(),
  )}.${milliseconds}${sign}${offsetHours}:${offsetRest}`;
}

export function isoDateTimeNow(): string {
  return toLocalISOString(new Date());
}

export function isoDateTimeDaysAgo(days: number, hour = 10): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(hour, 0, 0, 0);
  return toLocalISOString(date);
}
