declare module "node:crypto" {
  export function createHash(algorithm: string): { update(data: string): any; digest(encoding: "hex"): string };
}
declare module "node:assert/strict" {
  const assert: {
    equal(actual: unknown, expected: unknown): void;
    notEqual(actual: unknown, expected: unknown): void;
    ok(value: unknown): void;
    throws(fn: () => unknown, error?: unknown): void;
  };
  export default assert;
}
