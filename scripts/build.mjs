import { existsSync, readdirSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const tsc = resolve(root, "node_modules/typescript/bin/tsc");
if (!existsSync(tsc)) {
  console.error("TypeScript is not installed. Run npm ci before building.");
  process.exit(1);
}

const enginesRoot = resolve(root, "engines");
const configs = readdirSync(enginesRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => resolve(enginesRoot, entry.name, "tsconfig.json"))
  .filter(existsSync)
  .sort();

for (const output of [resolve(root, "dist"), ...configs.map((path) => resolve(path, "..", "dist"))]) {
  rmSync(output, { recursive: true, force: true });
}

const projects = [resolve(root, "tsconfig.json"), ...configs];
for (const project of projects) {
  const result = spawnSync(process.execPath, [tsc, "--project", project, "--pretty", "false"], {
    cwd: root,
    stdio: "inherit",
  });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}

console.log("Built package entry point and " + configs.length + " engine projects.");
