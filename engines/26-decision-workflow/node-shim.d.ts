declare module "node:crypto" {
  export function createHash(name: string): {
    update(data: string): any;
    digest(encoding: "hex"): string;
  };
}
