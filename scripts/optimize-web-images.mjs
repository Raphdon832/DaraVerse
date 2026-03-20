import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();

const TARGET_CONFIGS = [
  {
    dir: "public/AvatarThumbnails",
    maxWidth: 256,
    maxHeight: 256,
    pngOptions: { compressionLevel: 9, palette: true, quality: 78, effort: 10 },
  },
  {
    dir: "assets/badges",
    maxWidth: 768,
    maxHeight: 768,
    pngOptions: { compressionLevel: 9, palette: true, quality: 82, effort: 10 },
  },
  {
    dir: "public/UI_Assets/New Assets",
    maxWidth: 1600,
    maxHeight: 1600,
    pngOptions: { compressionLevel: 9, adaptiveFiltering: true, effort: 10 },
  },
  {
    dir: "public/UI_Assets",
    maxWidth: 1600,
    maxHeight: 1600,
    pngOptions: { compressionLevel: 9, adaptiveFiltering: true, effort: 10 },
  },
];

async function listPngFiles(directory) {
  const absoluteDir = path.join(ROOT, directory);
  const entries = await fs.readdir(absoluteDir, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".png"))
    .map((entry) => path.join(absoluteDir, entry.name));
}

function formatMb(bytes) {
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

async function optimizePng(filePath, config) {
  const originalBuffer = await fs.readFile(filePath);
  const originalSize = originalBuffer.length;

  const metadata = await sharp(originalBuffer).metadata();
  const originalWidth = metadata.width ?? 0;
  const originalHeight = metadata.height ?? 0;

  const shouldResize =
    (config.maxWidth && originalWidth > config.maxWidth) ||
    (config.maxHeight && originalHeight > config.maxHeight);

  let pipeline = sharp(originalBuffer);
  if (shouldResize) {
    pipeline = pipeline.resize({
      width: config.maxWidth,
      height: config.maxHeight,
      fit: "inside",
      withoutEnlargement: true,
    });
  }

  const optimizedBuffer = await pipeline.png(config.pngOptions).toBuffer();
  const optimizedSize = optimizedBuffer.length;
  const sizeReduced = optimizedSize < originalSize;

  if (!sizeReduced && !shouldResize) {
    return {
      changed: false,
      originalSize,
      optimizedSize,
      filePath,
    };
  }

  await fs.writeFile(filePath, optimizedBuffer);
  return {
    changed: true,
    originalSize,
    optimizedSize,
    filePath,
    resized: shouldResize,
  };
}

async function run() {
  let totalOriginal = 0;
  let totalOptimized = 0;
  let filesChanged = 0;
  let filesScanned = 0;
  const visitedFiles = new Set();

  for (const config of TARGET_CONFIGS) {
    const files = await listPngFiles(config.dir);
    for (const filePath of files) {
      if (visitedFiles.has(filePath)) {
        continue;
      }
      visitedFiles.add(filePath);
      const result = await optimizePng(filePath, config);
      filesScanned += 1;
      totalOriginal += result.originalSize;
      totalOptimized += result.optimizedSize;
      if (result.changed) {
        filesChanged += 1;
      }
    }
  }

  const bytesSaved = totalOriginal - totalOptimized;
  const percentSaved =
    totalOriginal > 0 ? ((bytesSaved / totalOriginal) * 100).toFixed(1) : "0.0";

  console.log(
    `Scanned ${filesScanned} PNG files, changed ${filesChanged}. Saved ${formatMb(bytesSaved)} (${percentSaved}%).`,
  );
}

run().catch((error) => {
  console.error("Image optimization failed:", error);
  process.exit(1);
});
