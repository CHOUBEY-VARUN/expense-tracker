import test from "node:test";
import assert from "node:assert/strict";
import { transactionWriteErrorCode, transactionWriteErrorMessage } from "./transactionErrors";

test("identifies database numeric range errors without exposing database details", () => {
  const error = Object.assign(new Error("numeric field overflow: private database detail"), {
    code: "22003",
  });

  assert.equal(transactionWriteErrorCode(error), "22003");
  const message = transactionWriteErrorMessage(error);
  assert.match(message, /database could not store this amount/i);
  assert.doesNotMatch(message, /private database detail|numeric field overflow/i);
});

test("returns a safe actionable message for unexpected write errors", () => {
  const message = transactionWriteErrorMessage(new Error("SQL text and credentials"));
  assert.match(message, /server error/i);
  assert.doesNotMatch(message, /SQL text|credentials/i);
  assert.equal(transactionWriteErrorCode(null), undefined);
});
