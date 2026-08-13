/*
 * Checks the release/album linked data. Run from the repo root:
 *
 *   node scripts/verify-release-albums.mjs
 *
 * Every problem it looks for fails silently in production: a mistyped releaseId
 * simply finds no album and emits nothing, and a wrong kind of MusicBrainz URL
 * produces valid-looking markup that identifies the wrong sort of thing. Nothing
 * here surfaces as an error at build time or in the browser.
 *
 * The identifier levels are deliberate. MusicBrainz and schema.org draw the same
 * distinction, so the abstraction levels line up:
 *
 *   the song    /recording/      MusicRecording
 *   the album   /release-group/  MusicAlbum
 *   an edition  /release/        MusicRelease   (not modelled here)
 *
 * Keeping albums on release-group and tracks on recording also means the two
 * namespaces cannot overlap, so an @id can never be claimed by both.
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const readJson = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));

const albums = readJson('src/data/linkedData/releaseAlbums.json');
const releases = fs
    .readdirSync(path.join(ROOT, 'src/data/releases/data'))
    .filter((file) => file.endsWith('.json'))
    .map((file) => readJson(`src/data/releases/data/${file}`));

const releaseBySlug = new Map(releases.map((release) => [release.slug, release]));
const albumIdOf = (album) =>
    album?.jsonLdId?.length ? album.jsonLdId : `https://www.dehlimusikk.no/#album-${album.id}`;

const problems = [];
const report = (subject, message) => problems.push(`${subject}: ${message}`);

// --- albums ---------------------------------------------------------------
for (const album of albums) {
    const subject = album.title?.length ? album.title : album.id || '(unnamed entry)';

    if (!album.id?.length) report(subject, 'missing id, so it emits nothing');
    if (!album.title?.length) report(subject, 'missing title, so it emits nothing');
    if (album.id?.includes('CHANGE-ME')) report(subject, 'id still holds the CHANGE-ME placeholder');

    if (album.jsonLdId?.length && !album.jsonLdId.includes('/release-group/')) {
        report(subject, `@id should be a MusicBrainz release-group, got ${album.jsonLdId}`);
    }

    const releaseIds = album.releaseIds || [];
    if (!releaseIds.length) report(subject, 'has no releaseIds');

    const unknown = releaseIds.filter((id) => !releaseBySlug.has(id));
    unknown.forEach((id) => report(subject, `releaseId matches no release slug: ${id}`));

    /*
     * A guest feature makes one track's artistName longer than the rest, as in
     * 'Haunted By Silhouettes & Bjorn "Speed" Strid', so comparing the strings
     * exactly flags a perfectly normal album. What actually signals a mistake is
     * an album whose tracks share no artist at all. Splitting on the same
     * separators releaseHelpers uses lets a guest credit through.
     */
    const artistSets = releaseIds
        .map((id) => releaseBySlug.get(id)?.artistName)
        .filter(Boolean)
        .map((name) => name.split(/[,&]/).map((part) => part.trim()));
    if (artistSets.length > 1) {
        const shared = artistSets.reduce((common, names) => common.filter((name) => names.includes(name)));
        if (!shared.length) {
            report(subject, `tracks share no common artist: ${[...new Set(artistSets.flat())].join(' / ')}`);
        }
    }
}

// A track legitimately belongs to several albums, so duplicates across albums are
// fine. Two albums sharing one @id are not: they would merge into a single node.
const albumIds = albums.map(albumIdOf);
albumIds
    .filter((id, index) => albumIds.indexOf(id) !== index)
    .forEach((id) => report('album @id', `used by more than one album: ${id}`));

// --- tracks ---------------------------------------------------------------
for (const release of releases) {
    if (release.jsonLdId?.length && !release.jsonLdId.includes('/recording/')) {
        report(release.title, `@id should be a MusicBrainz recording, got ${release.jsonLdId}`);
    }
}

// --- across both ----------------------------------------------------------
const trackIds = new Set(releases.map((release) => release.jsonLdId).filter(Boolean));
albums
    .filter((album) => trackIds.has(albumIdOf(album)))
    .forEach((album) => report(album.title || album.id, `@id is also used by a track: ${albumIdOf(album)}`));

// --- summary --------------------------------------------------------------
const live = albums.filter((album) => album.title?.length && album.id?.length);
const covered = new Set(albums.flatMap((album) => album.releaseIds || []).filter((id) => releaseBySlug.has(id)));
const onSeveral = [...new Set(albums.flatMap((a) => a.releaseIds || []).filter((id, i, all) => all.indexOf(id) !== i))];

console.log(`albums              ${live.length} emitting, ${albums.length - live.length} incomplete`);
console.log(`tracks with albums  ${covered.size} of ${releases.length}`);
console.log(`tracks on several   ${onSeveral.length}`);
console.log(`albums via fallback ${albums.filter((a) => !a.jsonLdId?.length).length} (no MusicBrainz release-group yet)`);

if (problems.length) {
    console.log(`\n${problems.length} problem(s):`);
    problems.forEach((problem) => console.log(`   ${problem}`));
} else {
    console.log('\nno problems found');
}

process.exitCode = problems.length ? 1 : 0;
