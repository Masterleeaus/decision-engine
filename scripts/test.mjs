import { existsSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const engineDirectories = readdirSync(resolve(root, "engines"), { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

const compiledTests = [];
const sourceTests = [];
for (const engine of engineDirectories) {
  const compiledDirectory = resolve(root, "engines", engine, "dist", "tests");
  if (existsSync(compiledDirectory)) {
    for (const name of readdirSync(compiledDirectory).sort()) {
      if (name.endsWith(".test.js")) compiledTests.push(resolve(compiledDirectory, name));
    }
  }
  const sourceDirectory = resolve(root, "engines", engine, "tests");
  if (existsSync(sourceDirectory)) {
    for (const name of readdirSync(sourceDirectory).sort()) {
      if (name.endsWith(".test.mjs")) sourceTests.push(resolve(sourceDirectory, name));
    }
  }
}

const tests = [...compiledTests, ...sourceTests];
if (tests.length === 0) {
  console.error("No compiled or JavaScript engine tests found. Run npm run build first.");
  process.exit(1);
}

console.log("Running " + compiledTests.length + " compiled TypeScript suites and " + sourceTests.length + " JavaScript suites.");
const result = spawnSync(process.execPath, ["--experimental-strip-types", "--test", ...tests], {
  cwd: root,
  stdio: "inherit",
});
if (result.error) throw result.error;
process.exit(result.status ?? 1);
