import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const DIST_DIR = path.join(ROOT, "dist");

function formatMb(bytes) {
  return Number((bytes / (1024 * 1024)).toFixed(2));
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

async function main() {
  const files = await collectFiles(DIST_DIR);
  const totalBytes = files.reduce((sum, file) => sum + file.sizeBytes, 0);

  const byExt = new Map();
  for (const file of files) {
    const extData = byExt.get(file.ext) ?? { count: 0, sizeBytes: 0 };
    extData.count += 1;
    extData.sizeBytes += file.sizeBytes;
    byExt.set(file.ext, extData);
  }

  const extSummary = [...byExt.entries()]
    .map(([ext, value]) => ({
      ext,
      count: value.count,
      sizeMB: formatMb(value.sizeBytes),
    }))
    .sort((a, b) => b.sizeMB - a.sizeMB);

  const topFiles = [...files]
    .sort((a, b) => b.sizeBytes - a.sizeBytes)
    .slice(0, 20)
    .map((file) => ({
      path: path.relative(ROOT, file.path).replace(/\\/g, "/"),
      sizeMB: formatMb(file.sizeBytes),
    }));

  const report = {
    generatedAt: new Date().toISOString(),
    totalFiles: files.length,
    totalSizeMB: formatMb(totalBytes),
    byExtension: extSummary,
    topFiles,
  };

  const reportPath = path.join(DIST_DIR, "asset-report.json");
  await fs.writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  console.log(`Generated ${path.relative(ROOT, reportPath)} (total ${report.totalSizeMB} MB).`);
  console.log("Top extensions:");
  for (const row of extSummary.slice(0, 8)) {
    console.log(`- ${row.ext}: ${row.sizeMB} MB (${row.count} files)`);
  }
}

main().catch((error) => {
  console.error("Failed to generate web asset report:", error);
  process.exit(1);
});
