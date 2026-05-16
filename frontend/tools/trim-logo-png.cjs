const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

function isWhiteOrTransparent(data, idx) {
  const r = data[idx];
  const g = data[idx + 1];
  const b = data[idx + 2];
  const a = data[idx + 3];
  const isTransparent = a === 0;
  const isWhite = r > 250 && g > 250 && b > 250;
  return isTransparent || isWhite;
}

function cropPNG(buffer) {
  const png = PNG.sync.read(buffer);
  const { width, height, data } = png;

  let minX = width, minY = height, maxX = 0, maxY = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (width * y + x) << 2;
      if (!isWhiteOrTransparent(data, idx)) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (minX > maxX || minY > maxY) {
    return null;
  }

  const w = maxX - minX + 1;
  const h = maxY - minY + 1;
  const out = new PNG({ width: w, height: h });

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const srcIdx = ((minY + y) * width + (minX + x)) << 2;
      const dstIdx = (y * w + x) << 2;
      out.data[dstIdx] = data[srcIdx];
      out.data[dstIdx + 1] = data[srcIdx + 1];
      out.data[dstIdx + 2] = data[srcIdx + 2];
      out.data[dstIdx + 3] = data[srcIdx + 3];
    }
  }

  return PNG.sync.write(out);
}

const logoPath = path.join(__dirname, '..', 'assets', 'logo.png');
const buf = fs.readFileSync(logoPath);
const cropped = cropPNG(buf);
if (!cropped) {
  console.log('No non-white/opaque pixels found — skipping crop.');
  process.exit(0);
}
const backupPath = logoPath.replace(/(\.png)$/i, '-backup$1');
if (!fs.existsSync(backupPath)) fs.copyFileSync(logoPath, backupPath);
fs.writeFileSync(logoPath, cropped);
console.log('Cropped and saved:', path.basename(logoPath));
