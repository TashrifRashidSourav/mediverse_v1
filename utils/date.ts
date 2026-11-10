/**
 * Date helpers. Appointment dates are stored as date-only strings
 * ("YYYY-MM-DD") that mean a *local* calendar day. `new Date("YYYY-MM-DD")`
 * parses as UTC, which shifts the day for users outside UTC (e.g. Bangladesh
 * between 00:00 and 06:00), so always go through these helpers.
 */

const pad = (n: number): string => String(n).padStart(2, '0');

/** Today's date in the user's local timezone as YYYY-MM-DD. */
export const todayLocalISO = (): string => toLocalISODate(new Date());

/** Format a Date as YYYY-MM-DD using local time. */
export const toLocalISODate = (d: Date): string =>
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** Parse "YYYY-MM-DD" as local midnight. Falls back to normal parsing for full ISO strings. */
export const parseLocalDate = (value: string): Date => {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    return m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : new Date(value);
};

/** Locale-formatted date for display, safe for date-only strings. */
export const formatLocalDate = (value: string | undefined | null): string => {
    if (!value) return '';
    const d = parseLocalDate(value);
    return isNaN(d.getTime()) ? value : d.toLocaleDateString();
};
