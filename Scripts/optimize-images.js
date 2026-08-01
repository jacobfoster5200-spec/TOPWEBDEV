// Converts every PNG/JPG in the project to a resized, recompressed WebP
// placed alongside the original (originals are left untouched — update the
// <img src> / CSS background-image references to the new .webp paths once
// you've reviewed the output). Run: npm run optimize:images
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const ROOT = path.resolve(__dirname, "..");
const EXCLUDE_DIRS = new Set([
  "node_modules",
  ".git",
  "Scripts",
  "src",
  path.join("assets", "css"),
  path.join("assets", "js"),
]);
const SOURCE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg"]);
const MAX_WIDTH = 1600;
const WEBP_QUALITY = 80;

function shouldSkipDir(relativePath) {
  const segments = relativePath.split(path.sep);
  return segments.some((segment, i) =>
    EXCLUDE_DIRS.has(path.join(...segments.slice(0, i + 1)))
  );
}

function collectImages(dir, relativeDir = "") {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let files = [];
  for (const entry of entries) {
    const relativePath = path.join(relativeDir, entry.name);
    if (shouldSkipDir(relativePath)) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(collectImages(fullPath, relativePath));
    } else if (SOURCE_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
      files.push(fullPath);
    }
  }
  return files;
}

async function convertImage(filePath) {
  const outputPath = filePath.replace(/\.(png|jpe?g)$/i, ".webp");
  const originalSize = fs.statSync(filePath).size;

  const image = sharp(filePath);
  const metadata = await image.metadata();
  if (metadata.width && metadata.width > MAX_WIDTH) {
    image.resize({ width: MAX_WIDTH });
  }

  await image.webp({ quality: WEBP_QUALITY }).toFile(outputPath);

  const newSize = fs.statSync(outputPath).size;
  return { filePath, outputPath, originalSize, newSize };
}

async function main() {
  const images = collectImages(ROOT);
  if (images.length === 0) {
    console.log("No PNG/JPG files found.");
    return;
  }

  console.log(`Converting ${images.length} image(s) to WebP...\n`);

  let totalOriginal = 0;
  let totalNew = 0;

  for (const filePath of images) {
    try {
      const result = await convertImage(filePath);
      totalOriginal += result.originalSize;
      totalNew += result.newSize;
      const savingPct = (
        (1 - result.newSize / result.originalSize) *
        100
      ).toFixed(0);
      console.log(
        `${path.relative(ROOT, result.filePath)} -> ${path.relative(ROOT, result.outputPath)} ` +
          `(${(result.originalSize / 1024).toFixed(0)}KB -> ${(result.newSize / 1024).toFixed(0)}KB, -${savingPct}%)`
      );
    } catch (err) {
      console.error(`Failed to convert ${filePath}:`, err.message);
    }
  }

  const totalSavingPct = ((1 - totalNew / totalOriginal) * 100).toFixed(0);
  console.log(
    `\nTotal: ${(totalOriginal / 1024 / 1024).toFixed(1)}MB -> ${(totalNew / 1024 / 1024).toFixed(1)}MB (-${totalSavingPct}%)`
  );
  console.log(
    "\nOriginals were left in place. Once you've spot-checked quality, update each <img src> and CSS background-image reference from .png/.jpg to .webp, then delete the old files."
  );
}

main();
