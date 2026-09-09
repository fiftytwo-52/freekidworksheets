import sharp from 'sharp';
import { readdir, stat, unlink } from 'fs/promises';
import { join, extname } from 'path';

const DIR = './public/worksheets';
const files = (await readdir(DIR)).filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f));

let totalBefore = 0, totalAfter = 0;

for (const file of files) {
    const filePath = join(DIR, file);
    const { size } = await stat(filePath);
    totalBefore += size;

    const img = sharp(filePath);
    const metadata = await img.metadata();

    // Resize to 1200px max (A4 at 120dpi is ~1488px, still good for print)
    const maxDim = 1200;
    if (metadata.width > maxDim || metadata.height > maxDim) {
        img.resize(maxDim, maxDim, { fit: 'inside', withoutEnlargement: true });
    }

    // Compress based on original format
    const ext = extname(file).toLowerCase();
    let outputBuffer;
    if (ext === '.png') {
        outputBuffer = await img.png({ compressionLevel: 9, quality: 50 }).toBuffer();
    } else if (ext === '.webp') {
        outputBuffer = await img.webp({ quality: 50 }).toBuffer();
    } else {
        // jpg/jpeg
        outputBuffer = await img.jpeg({ quality: 50, mozjpeg: true }).toBuffer();
    }

    await sharp(outputBuffer).toFile(filePath);
    const { size: newSize } = await stat(filePath);
    totalAfter += newSize;
}

console.log(`Compressed ${files.length} images`);
console.log(`Before: ${(totalBefore / 1024 / 1024).toFixed(1)}MB`);
console.log(`After: ${(totalAfter / 1024 / 1024).toFixed(1)}MB`);
console.log(`Reduction: ${((1 - totalAfter / totalBefore) * 100).toFixed(0)}%`);
