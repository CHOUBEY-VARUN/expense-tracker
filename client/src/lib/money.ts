export type ApiMoneyValue = string | number;

export type MoneyValue = {
  decimal: string;
  approximate: boolean;
};

function expandNumber(value: number): string {
  if (!Number.isFinite(value)) {
    throw new Error("Monetary API value must be finite.");
  }

  const source = String(value);
  const match = source.match(/^(-?)(\d+)(?:\.(\d+))?(?:e([+-]?\d+))?$/i);
  if (!match) {
    throw new Error("Monetary API value has an unsupported number format.");
  }

  const [, sign, integerPart, fractionPart = "", exponentText = "0"] = match;
  const digits = integerPart + fractionPart;
  const decimalIndex = integerPart.length + Number(exponentText);

  if (decimalIndex <= 0) {
    return `${sign}0.${"0".repeat(-decimalIndex)}${digits}`;
  }
  if (decimalIndex >= digits.length) {
    return `${sign}${digits}${"0".repeat(decimalIndex - digits.length)}`;
  }
  return `${sign}${digits.slice(0, decimalIndex)}.${digits.slice(decimalIndex)}`;
}

function decimalToCents(decimal: string): bigint {
  const match = decimal.match(/^(-?)(\d+)(?:\.(\d*))?$/);
  if (!match) {
    throw new Error("Monetary API value must be a decimal string.");
  }

  const [, sign, whole, fraction = ""] = match;
  const cents = BigInt(whole) * 100n + BigInt(fraction.padEnd(2, "0").slice(0, 2));
  const rounded = fraction.length > 2 && fraction[2] >= "5" ? cents + 1n : cents;
  return sign === "-" ? -rounded : rounded;
}

function centsToDecimal(cents: bigint): string {
  const sign = cents < 0n ? "-" : "";
  const absolute = cents < 0n ? -cents : cents;
  return `${sign}${absolute / 100n}.${String(absolute % 100n).padStart(2, "0")}`;
}

export function normalizeApiMoney(value: unknown): MoneyValue {
  if (typeof value === "string") {
    const decimal = value.trim();
    if (!/^-?\d+(?:\.\d{1,2})?$/.test(decimal)) {
      throw new Error("Monetary API string must have no more than two decimal places.");
    }
    return { decimal: centsToDecimal(decimalToCents(decimal)), approximate: false };
  }

  if (typeof value === "number") {
    // The old API has already parsed/serialized this through IEEE-754. Stringifying
    // it gives the best available decimal representation, but cannot restore lost cents.
    const decimal = expandNumber(value);
    return {
      decimal: centsToDecimal(decimalToCents(decimal)),
      // At 2^46 rupees, adjacent IEEE-754 values are more than one paisa apart.
      approximate: Math.abs(value) >= 2 ** 46,
    };
  }

  throw new Error("Monetary API value must be a decimal string or number.");
}

export function amountToCents(amount: string): bigint {
  if (!/^-?\d+\.\d{2}$/.test(amount)) {
    throw new Error("Normalized amount must have exactly two decimal places.");
  }
  return decimalToCents(amount);
}

export function formatMoney(amount: MoneyValue): string {
  const negative = amount.decimal.startsWith("-");
  const [whole, fraction] = amount.decimal.replace(/^-/, "").split(".");
  const approximation = amount.approximate ? "≈" : "";
  const sign = negative ? "−" : "";
  return `${approximation}${sign}₹${BigInt(whole).toLocaleString("en-IN")}.${fraction}`;
}

export function balanceProgressPercent(balance: MoneyValue, target: MoneyValue): number {
  const balanceCents = amountToCents(balance.decimal);
  const targetCents = amountToCents(target.decimal);
  if (balanceCents <= 0n) return 0;
  if (balanceCents >= targetCents) return 100;
  return Number((balanceCents * 100n) / targetCents);
}
