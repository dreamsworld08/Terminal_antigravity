const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PUBLIC_IMAGES_DIR = path.join(__dirname, 'public', 'images');
const PRODUCTS_DIR = path.join(PUBLIC_IMAGES_DIR, 'products');
const UI_DIR = path.join(PUBLIC_IMAGES_DIR, 'ui');

[PUBLIC_IMAGES_DIR, PRODUCTS_DIR, UI_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

async function downloadImage(url, dest) {
    if (fs.existsSync(dest)) {
        return true;
    }
    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.error(`Failed to fetch ${url}: ${response.statusText}`);
            return false;
        }
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        fs.writeFileSync(dest, buffer);
        return true;
    } catch (e) {
        console.error(`Error downloading ${url}:`, e.message);
        return false;
    }
}

function processFiles(directory, outputDir, prefix) {
    try {
        const results = execSync(`grep -rno "https://images.unsplash.com/photo-[a-zA-Z0-9\\-]*\\?\\([^\\"'\\s}]*\\)" ${directory}`).toString();
        const lines = results.split('\n').filter(Boolean);
        const map = new Map();

        lines.forEach(line => {
            const urlMatch = line.match(/(https:\/\/images\.unsplash\.com\/photo-[a-zA-Z0-9\-]+(\?[^"'\s}]+)?)/);
            if (urlMatch) {
                const url = urlMatch[1];
                const idMatch = url.match(/photo-([a-zA-Z0-9\-]+)/);
                if (idMatch) {
                    const id = idMatch[1];
                    const localName = `${prefix}-${id}.jpg`;
                    const localPath = `/images/${path.relative(PUBLIC_IMAGES_DIR, outputDir)}/${localName}`;
                    map.set(url, { url, localPath, localDest: path.join(outputDir, localName) });
                }
            }
        });
        return Array.from(map.values());
    } catch (e) {
        console.log("No images found in", directory);
        return [];
    }
}

async function run() {
    console.log("Extracting URLs...");
    const seedImages = processFiles('prisma/seed.ts', PRODUCTS_DIR, 'product');
    const uiImages = processFiles('src/', UI_DIR, 'ui');

    // Merge, prefer products for overlap
    const allImagesMap = new Map();
    uiImages.forEach(img => allImagesMap.set(img.url, img));
    seedImages.forEach(img => allImagesMap.set(img.url, img));

    const allImages = Array.from(allImagesMap.values());
    console.log(`Found ${allImages.length} unique images to download.`);

    const successfulImages = [];

    for (let i = 0; i < allImages.length; i++) {
        const { url, localDest } = allImages[i];
        console.log(`[${i + 1}/${allImages.length}] Downloading ${url} ...`);
        const success = await downloadImage(url, localDest);
        if (success) {
            successfulImages.push(allImages[i]);
        }
    }

    console.log("Downloads complete! Now replacing in files...");

    const filesToSearch = execSync(`find src prisma -type f -name "*.ts" -o -name "*.tsx"`).toString().split('\n').filter(Boolean);

    for (const file of filesToSearch) {
        let content = fs.readFileSync(file, 'utf8');
        let modified = false;

        successfulImages.forEach(({ url, localPath }) => {
            if (content.includes(url)) {
                content = content.split(url).join(localPath);
                modified = true;
            }
        });

        if (modified) {
            fs.writeFileSync(file, content);
            console.log(`Updated ${file}`);
        }
    }

    console.log("Done!");
}

run().catch(console.error);
