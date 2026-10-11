export function transactionWriteErrorCode(error: unknown): string | undefined {
  if (typeof error !== "object" || error === null || !("code" in error)) {
    return undefined;
  }
  return typeof error.code === "string" ? error.code : undefined;
}

export function transactionWriteErrorMessage(error: unknown): string {
  if (transactionWriteErrorCode(error) === "22003") {
    return "The database could not store this amount. Its amount limit may need an update; please contact support.";
  }
  return "Could not save the transaction because of a server error. Please try again or contact support.";
}
