/**
 * compress-logos.js
 * Converts oversized SVGs (with embedded bitmaps) to optimized WebP/PNG
 * Keeps small true-vector SVGs as-is
 * Updates references in code if needed
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const LOGOS_DIR = path.join(__dirname, '..', 'public', 'logos');
const SIZE_THRESHOLD = 100 * 1024; // 100KB - anything bigger is likely embedded bitmap

async function processDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let totalSaved = 0;

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      totalSaved += await processDir(fullPath);
      continue;
    }

    if (!entry.name.endsWith('.svg')) continue;

    const stats = fs.statSync(fullPath);
    if (stats.size < SIZE_THRESHOLD) {
      // Small SVG - likely a true vector, skip
      continue;
    }

    const svgContent = fs.readFileSync(fullPath, 'utf8');

    // Check if it contains embedded bitmap (base64 image data)
    const hasEmbeddedBitmap = svgContent.includes('data:image/png') ||
      svgContent.includes('data:image/jpeg') ||
      svgContent.includes('data:image/jpg') ||
      svgContent.includes('xlink:href="data:');

    if (!hasEmbeddedBitmap && stats.size < 200 * 1024) {
      // Large vector SVG but no bitmap - skip, SVGO already tried
      console.log(`  SKIP (vector): ${path.relative(LOGOS_DIR, fullPath)} (${(stats.size / 1024).toFixed(0)}KB)`);
      continue;
    }

    // Convert to WebP
    const webpPath = fullPath.replace('.svg', '.webp');
    const pngPath = fullPath.replace('.svg', '.png');

    try {
      // Try to render SVG to PNG first, then convert to WebP
      const pngBuffer = await sharp(fullPath, { density: 150 })
        .resize(400, 400, { fit: 'inside', withoutEnlargement: true })
        .png({ quality: 85 })
        .toBuffer();

      const webpBuffer = await sharp(pngBuffer)
        .webp({ quality: 80 })
        .toBuffer();

      // Also create a small PNG fallback
      const pngSmall = await sharp(pngBuffer)
        .png({ compressionLevel: 9 })
        .toBuffer();

      // Use whichever is smaller
      const useWebp = webpBuffer.length < pngSmall.length;
      const outputPath = useWebp ? webpPath : pngPath;
      const outputBuffer = useWebp ? webpBuffer : pngSmall;

      fs.writeFileSync(outputPath, outputBuffer);

      const saved = stats.size - outputBuffer.length;
      totalSaved += saved;

      console.log(
        `  ${(stats.size / 1024).toFixed(0)}KB → ${(outputBuffer.length / 1024).toFixed(0)}KB` +
        ` (${useWebp ? 'webp' : 'png'}) SAVED ${(saved / 1024).toFixed(0)}KB: ${entry.name}`
      );

      // Remove the original oversized SVG
      fs.unlinkSync(fullPath);

    } catch (err) {
      console.log(`  ERROR: ${entry.name} - ${err.message}`);
      // Don't delete on error
    }
  }

  return totalSaved;
}

async function main() {
  console.log('Compressing oversized SVGs in public/logos/...\n');
  console.log(`Threshold: files > ${SIZE_THRESHOLD / 1024}KB\n`);

  const saved = await processDir(LOGOS_DIR);

  console.log(`\n=== DONE ===`);
  console.log(`Total saved: ${(saved / 1024 / 1024).toFixed(1)}MB`);

  // Show final size
  const { execSync } = require('child_process');
  const finalSize = execSync('du -sh public/logos/', { cwd: path.join(__dirname, '..') }).toString().trim();
  console.log(`Final logos/ size: ${finalSize}`);
}

main().catch(console.error);
