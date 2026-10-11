import test from "node:test";
import assert from "node:assert/strict";
import { centsToAmount, MAX_TRANSACTION_AMOUNT, parseAmount, subtractAmounts, sumAmounts } from "./amount";

test("parses regular and decimal transaction amounts as exact cents", () => {
  assert.equal(parseAmount("42"), 4200n);
  assert.equal(parseAmount("0.10"), 10n);
  assert.equal(parseAmount("123456789.99"), 12345678999n);
});

test("accepts one decimal place and leading zeros, then serializes normalized paise", () => {
  const oneDecimal = parseAmount("12.3");
  const leadingZeros = parseAmount("0012.30");

  assert.equal(oneDecimal, 1230n);
  assert.equal(leadingZeros, 1230n);
  assert.equal(centsToAmount(oneDecimal!), "12.30");
  assert.equal(centsToAmount(leadingZeros!), "12.30");
});

test("accepts the documented maximum and rejects values outside it", () => {
  assert.equal(parseAmount("9999999999.00"), 999999999900n);
  assert.equal(parseAmount("10000000000.00"), 1000000000000n);
  assert.equal(centsToAmount(parseAmount(MAX_TRANSACTION_AMOUNT)!), MAX_TRANSACTION_AMOUNT);
  assert.equal(parseAmount("1000000000000.00"), null);
});

test("rejects zero, negatives, empty values, malformed strings, and excess precision", () => {
  for (const value of ["0", "-1", "", "1e3", "12.345", "NaN"]) {
    assert.equal(parseAmount(value), null, value);
  }
});

test("totals preserve cents without floating point drift", () => {
  assert.equal(sumAmounts(["0.10", "0.20", "999999999999.99"]), "1000000000000.29");
  assert.equal(subtractAmounts("1000000000000.29", "999999999999.99"), "0.30");
  assert.equal(subtractAmounts("1.00", "1.25"), "-0.25");
});
