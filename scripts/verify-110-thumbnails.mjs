/*
 * Checks that every _110 thumbnail the components reference exists, and that each
 * one is square. Run from the repo root:
 *
 *   node scripts/verify-110-thumbnails.mjs
 *
 * The 55px circular thumbnails need a 2x candidate at 110x110. It has to be the
 * same square crop as _55, not the wide _350 crop: pairing crops of different
 * aspect ratios in one srcset is what made high-DPI phones squash the wide image
 * into the circle.
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const readJson = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));

// Mirrors convertToUrlFriendlyString for the cases these ids use
const slug = (value) =>
    value
        .toLowerCase()
        .replace(/&/g, ' and ')
        .replace(/\+/g, ' plus ')
        .replace(/[æä]/g, 'ae')
        .replace(/[øö]/g, 'oe')
        .replace(/å/g, 'aa')
        .replace(/ë/g, 'e')
        .replace(/[/]/g, '-')
        .replace(/[.,]/g, '-')
        .replace(/( - )/g, '-')
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]+/g, '')
        .replace(/-{2,}/g, '-')
        .replace(/^[^a-z0-9]*|[^a-z0-9]*$/g, '');

const groups = [];

groups.push({
    label: 'posts',
    dir: 'public/data/posts/web',
    names: readJson('src/data/posts/data/all.json').map((post) => post.thumbnailFilename)
});

groups.push({
    label: 'videos',
    dir: 'public/data/videos/web',
    names: readJson('src/data/videos/data/all.json').map((video) => video.thumbnailFilename)
});

groups.push({
    label: 'products',
    dir: 'public/data/products/web',
    names: readJson('src/data/products/data/all.json').map((product) => slug(product.title))
});

for (const type of ['instruments', 'effects', 'amplifiers']) {
    groups.push({
        label: `equipment/${type}`,
        dir: `public/data/equipment/${type}/web`,
        names: readJson(`src/data/equipment/data/${type}.json`).map((item) => slug(`${item.brand} ${item.model}`))
    });
}

// The three equipment type cards on /equipment
groups.push({
    label: 'equipment types',
    dir: 'public/data/equipment/web',
    names: ['instruments', 'effects', 'amplifiers']
});

// Shown beside FAQ hits in the search dropdown and on /search
groups.push({
    label: 'faq (search result)',
    dir: 'public/data/frequentlyAskedQuestions/web',
    names: ['thumbnail']
});

groups.push({
    label: 'releases',
    dir: 'public/data/releases/web',
    names: fs
        .readdirSync(path.join(ROOT, 'src/data/releases/data'))
        .filter((file) => file.endsWith('.json'))
        .map((file) => readJson(`src/data/releases/data/${file}`).thumbnailFilename)
});

// The unreleased placeholder lives in /images and is png rather than jpg
const placeholder = {
    label: 'comingSoon placeholder',
    files: ['no', 'en'].flatMap((lang) =>
        ['avif', 'webp', 'png'].map((extension) => `public/images/comingSoon_${lang}_110.${extension}`)
    )
};

function jpegSize(file) {
    const d = fs.readFileSync(file);
    let i = 2;
    while (i < d.length) {
        if (d[i] !== 0xff) { i += 1; continue; }
        const marker = d[i + 1];
        if (marker >= 0xc0 && marker <= 0xc3) return { width: d.readUInt16BE(i + 7), height: d.readUInt16BE(i + 5) };
        if (marker === 0xd8 || marker === 0xd9 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) { i += 2; continue; }
        i += 2 + d.readUInt16BE(i + 2);
    }
    return null;
}

let expected = 0;
const missing = [];
const notSquare = [];

for (const { label, dir, names } of groups) {
    let present = 0;
    for (const name of new Set(names)) {
        for (const [folder, extension] of [['avif', 'avif'], ['webp', 'webp'], ['jpg', 'jpg']]) {
            const relative = `${dir}/${folder}/${name}_110.${extension}`;
            expected += 1;
            if (fs.existsSync(path.join(ROOT, relative))) {
                present += 1;
                if (extension === 'jpg') {
                    const size = jpegSize(path.join(ROOT, relative));
                    if (size && size.width !== size.height) notSquare.push(`${relative} is ${size.width}x${size.height}`);
                }
            } else {
                missing.push(relative);
            }
        }
    }
    console.log(`${label.padEnd(22)} ${present} / ${new Set(names).size * 3}`);
}

let placeholderPresent = 0;
for (const relative of placeholder.files) {
    expected += 1;
    if (fs.existsSync(path.join(ROOT, relative))) placeholderPresent += 1;
    else missing.push(relative);
}
console.log(`${placeholder.label.padEnd(22)} ${placeholderPresent} / ${placeholder.files.length}`);

console.log(`\nexpected ${expected} files, missing ${missing.length}`);
missing.slice(0, 15).forEach((m) => console.log('   missing:', m));
if (missing.length > 15) console.log(`   ... and ${missing.length - 15} more`);

if (notSquare.length) {
    console.log(`\n${notSquare.length} file(s) are not square, which is what causes the distortion:`);
    notSquare.slice(0, 15).forEach((n) => console.log('   ', n));
}

process.exitCode = missing.length || notSquare.length ? 1 : 0;
