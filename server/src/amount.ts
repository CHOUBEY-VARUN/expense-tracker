export const MAX_TRANSACTION_AMOUNT = "999999999999.99";
export const MAX_TRANSACTION_CENTS = 99_999_999_999_999n;

export function parseAmount(value: unknown): bigint | null {
  if (typeof value !== "string" && typeof value !== "number") return null;
  const input = String(value).trim();
  if (!/^\d+(?:\.\d{1,2})?$/.test(input)) return null;

  const cents = decimalToCents(input);
  return cents > 0n && cents <= MAX_TRANSACTION_CENTS ? cents : null;
}

function decimalToCents(value: string): bigint {
  const [whole, fraction = ""] = value.split(".");
  return BigInt(whole) * 100n + BigInt(fraction.padEnd(2, "0"));
}

export function centsToAmount(cents: bigint): string {
  const whole = cents / 100n;
  const fraction = String(cents % 100n).padStart(2, "0");
  return `${whole}.${fraction}`;
}

export function signedCentsToAmount(cents: bigint): string {
  return `${cents < 0n ? "-" : ""}${centsToAmount(cents < 0n ? -cents : cents)}`;
}

export function sumAmounts(amounts: string[]): string {
  const cents = amounts.reduce((sum, amount) => {
    if (!/^\d+(?:\.\d{1,2})?$/.test(amount)) throw new Error("Invalid persisted transaction amount");
    return sum + decimalToCents(amount);
  }, 0n);
  return centsToAmount(cents);
}

export function subtractAmounts(left: string, right: string): string {
  if (!/^\d+(?:\.\d{1,2})?$/.test(left) || !/^\d+(?:\.\d{1,2})?$/.test(right)) {
    throw new Error("Invalid calculated transaction total");
  }
  return signedCentsToAmount(decimalToCents(left) - decimalToCents(right));
}
