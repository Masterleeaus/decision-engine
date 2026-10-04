import { readdirSync } from "node:fs";
import { resolve, relative } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(fileURLToPath(new URL(".", import.meta.url)), "..");
const enginesRoot = resolve(repositoryRoot, "engines");
const testFilePattern = /\.test\.(?:mjs|ts)$/;

function collectFiles(directory) {
  const files = [];
  for (const entry of readdirSync(directory, { withFileTypes: true }).sort((left, right) =>
    left.name.localeCompare(right.name),
  )) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectFiles(path));
    } else if (entry.isFile() && testFilePattern.test(entry.name)) {
      files.push(path);
    }
  }
  return files;
}

const testFiles = collectFiles(enginesRoot)
  .filter((path) => {
    const normalized = relative(repositoryRoot, path).replaceAll("\\", "/");
    return normalized.includes("/tests/");
  })
  .sort((left, right) => left.localeCompare(right));

if (testFiles.length === 0) {
  throw new Error("No engine test files were found under engines/*/tests/.");
}

const displayFiles = testFiles.map((path) => relative(repositoryRoot, path).replaceAll("\\", "/"));
console.log(`Running ${testFiles.length} reference test files with ${process.execPath}:`);
for (const file of displayFiles) console.log(`- ${file}`);

const result = spawnSync(
  process.execPath,
  ["--experimental-transform-types", "--experimental-loader", fileURLToPath(new URL("./reference-tests-loader.mjs", import.meta.url)), "--test", ...testFiles],
  {
    cwd: repositoryRoot,
    stdio: "inherit",
    windowsHide: true,
  },
);

if (result.error) {
  console.error(`Unable to start the Node.js test runner: ${result.error.message}`);
  process.exitCode = 1;
} else if (result.status === null) {
  console.error("The Node.js test runner ended without an exit status.");
  process.exitCode = 1;
} else {
  process.exitCode = result.status;
}
