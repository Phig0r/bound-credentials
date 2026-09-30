/** Extract a useful wallet/contract error without assuming the thrown value's shape. */
export function errorMessage(error: unknown, fallback: string): string {
  if (typeof error === 'object' && error !== null) {
    for (const key of ['reason', 'message'] as const) {
      if (key in error) {
        const value = (error as Record<string, unknown>)[key];
        if (typeof value === 'string' && value) return value;
      }
    }
  }
  return fallback;
}
