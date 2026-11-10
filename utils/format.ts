/** All prices in the app are in Bangladeshi Taka (matches the pricing page and payment popup). */
export const formatMoney = (amount: number | undefined | null, fractionDigits = 2): string => {
    const value = Number(amount) || 0;
    return `BDT ${value.toLocaleString(undefined, {
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits,
    })}`;
};
