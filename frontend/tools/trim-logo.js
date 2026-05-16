const Jimp = require('jimp');
const fs = require('fs');
const path = require('path');

async function trimImage(srcPath) {
  const img = await Jimp.read(srcPath);
  const { width, height } = img.bitmap;

  let minX = width, minY = height, maxX = 0, maxY = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const rgba = Jimp.intToRGBA(img.getPixelColor(x, y));
      const { r, g, b, a } = rgba;
      const isTransparent = a === 0;
      const isWhite = r > 250 && g > 250 && b > 250;
      if (!isTransparent && !isWhite) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (minX > maxX || minY > maxY) {
    console.log('No non-white/opaque pixels found — skipping crop.');
    return false;
  }

  const w = maxX - minX + 1;
  const h = maxY - minY + 1;

  const backupPath = srcPath.replace(/(\.png|\.jpg|\.jpeg)$/i, '-backup$1');
  if (!fs.existsSync(backupPath)) {
    fs.copyFileSync(srcPath, backupPath);
    console.log('Backup created:', path.basename(backupPath));
  }

  await img.crop(minX, minY, w, h).writeAsync(srcPath);
  console.log('Cropped and saved:', path.basename(srcPath), '->', `${w}x${h}`);
  return true;
}

const logoPath = path.join(__dirname, '..', 'assets', 'logo.png');
trimImage(logoPath).catch((err) => {
  console.error('Error trimming image:', err);
  process.exit(1);
});
