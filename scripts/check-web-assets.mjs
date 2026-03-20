import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const DIST_DIR = path.join(ROOT, "dist");

const BUDGETS = {
  totalMB: 130,
  pngMB: 95,
  jsMB: 6.5,
  largestPngMB: 2.25,
};

function toMb(bytes) {
  return bytes / (1024 * 1024);
}

async function collectFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectFiles(fullPath)));
    } else if (entry.isFile()) {
      const stats = await fs.stat(fullPath);
      files.push({
        path: fullPath,
        ext: path.extname(entry.name).toLowerCase() || "<none>",
        sizeBytes: stats.size,
      });
    }
  }
  return files;
}

function formatFixed(value) {
  return Number(value.toFixed(2));
}

async function main() {
  const files = await collectFiles(DIST_DIR);

  const totalBytes = files.reduce((sum, file) => sum + file.sizeBytes, 0);
  const pngFiles = files.filter((file) => file.ext === ".png");
  const jsFiles = files.filter((file) => file.ext === ".js");

  const pngBytes = pngFiles.reduce((sum, file) => sum + file.sizeBytes, 0);
  const jsBytes = jsFiles.reduce((sum, file) => sum + file.sizeBytes, 0);
  const largestPngBytes = pngFiles.reduce((max, file) => Math.max(max, file.sizeBytes), 0);

  const metrics = {
    totalMB: toMb(totalBytes),
    pngMB: toMb(pngBytes),
    jsMB: toMb(jsBytes),
    largestPngMB: toMb(largestPngBytes),
  };

  const failures = [];
  if (metrics.totalMB > BUDGETS.totalMB) {
    failures.push(`Total dist size ${formatFixed(metrics.totalMB)} MB exceeds ${BUDGETS.totalMB} MB.`);
  }
  if (metrics.pngMB > BUDGETS.pngMB) {
    failures.push(`PNG total ${formatFixed(metrics.pngMB)} MB exceeds ${BUDGETS.pngMB} MB.`);
  }
  if (metrics.jsMB > BUDGETS.jsMB) {
    failures.push(`JS total ${formatFixed(metrics.jsMB)} MB exceeds ${BUDGETS.jsMB} MB.`);
  }
  if (metrics.largestPngMB > BUDGETS.largestPngMB) {
    failures.push(
      `Largest PNG ${formatFixed(metrics.largestPngMB)} MB exceeds ${BUDGETS.largestPngMB} MB.`,
    );
  }

  console.log("Web asset budget check:");
  console.log(`- Total dist: ${formatFixed(metrics.totalMB)} MB (budget ${BUDGETS.totalMB} MB)`);
  console.log(`- PNG total: ${formatFixed(metrics.pngMB)} MB (budget ${BUDGETS.pngMB} MB)`);
  console.log(`- JS total: ${formatFixed(metrics.jsMB)} MB (budget ${BUDGETS.jsMB} MB)`);
  console.log(
    `- Largest PNG: ${formatFixed(metrics.largestPngMB)} MB (budget ${BUDGETS.largestPngMB} MB)`,
  );

  if (failures.length > 0) {
    console.error("Budget check failed:");
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
    process.exit(1);
  }

  console.log("Budget check passed.");
}

main().catch((error) => {
  console.error("Failed to run asset budget check:", error);
  process.exit(1);
});
