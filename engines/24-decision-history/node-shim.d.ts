declare module "node:crypto" { export function createHash(name:string): { update(data:string): any; digest(enc:"hex"): string }; }
declare module "node:assert/strict" { const assert:any; export default assert; }
