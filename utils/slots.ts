/**
 * One document per booked time slot, e.g. users/{hospital}/slots/{doctor}_{date}_{HHmm}.
 * Booking creates it inside a transaction, so two patients cannot take the same slot,
 * and cancelling an appointment deletes it again.
 */
export const slotId = (doctorId: string, date: string, time: string): string =>
    `${doctorId}_${date}_${time.replace(':', '')}`;

/** "09:30" for a Date, in local time. */
export const toHHmm = (d: Date): string =>
    `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
