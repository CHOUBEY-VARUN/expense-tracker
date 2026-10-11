import test from "node:test";
import assert from "node:assert/strict";
import {
  balanceProgressPercent,
  formatMoney,
  normalizeApiMoney,
} from "../src/lib/money.ts";

test("normalizes exact decimal-string responses, including the maximum", () => {
  const amount = normalizeApiMoney("999999999999.99");

  assert.equal(amount.decimal, "999999999999.99");
  assert.equal(amount.approximate, false);
  assert.equal(formatMoney(amount), "₹9,99,99,99,99,999.99");
});

test("normalizes ordinary legacy numeric responses and floating sum artifacts", () => {
  assert.equal(normalizeApiMoney(12.3).decimal, "12.30");
  assert.equal(normalizeApiMoney(0.1 + 0.2).decimal, "0.30");
  assert.equal(normalizeApiMoney(12.3).approximate, false);
});

test("marks large legacy numbers approximate instead of claiming lost precision is recovered", () => {
  const amount = normalizeApiMoney(2 ** 46);

  assert.equal(amount.approximate, true);
  assert.match(formatMoney(amount), /^≈₹/);
});

test("computes dashboard progress exactly for string and legacy numeric totals", () => {
  const target = normalizeApiMoney("10000.00");
  assert.equal(balanceProgressPercent(normalizeApiMoney("2500.00"), target), 25);
  assert.equal(balanceProgressPercent(normalizeApiMoney(10000), target), 100);
  assert.equal(balanceProgressPercent(normalizeApiMoney(-0.25), target), 0);
});

test("rejects malformed string values and non-finite legacy numbers", () => {
  assert.throws(() => normalizeApiMoney("1.234"), /two decimal places/);
  assert.throws(() => normalizeApiMoney(Number.POSITIVE_INFINITY), /finite/);
});
