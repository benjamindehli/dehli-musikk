/*
 * Generates .well-known/agent-skills/index.json from the SKILL.md files beside
 * it, per the Agent Skills Discovery RFC v0.2.0.
 *
 *   node scripts/agent-skills.mjs            rewrite the index
 *   node scripts/agent-skills.mjs --check    fail if it is out of date
 *
 * The index carries a SHA-256 of each skill document, which is the whole reason
 * this is generated rather than written by hand: edit a SKILL.md, forget the
 * digest, and the index still looks perfectly well formed while telling every
 * reader the file has been tampered with. --check runs in CI so that cannot
 * reach a release.
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const SKILLS_DIR = path.join(ROOT, 'public', '.well-known', 'agent-skills');
const INDEX_FILE = path.join(SKILLS_DIR, 'index.json');
const SITE_ORIGIN = 'https://www.dehlimusikk.no';
const SCHEMA = 'https://schemas.agentskills.io/discovery/0.2.0/schema.json';

const checkOnly = process.argv.includes('--check');

/*
 * The description in the index has to match the one inside the document, so a
 * reader choosing from the index and a reader who fetched the file are told the
 * same thing. Taken from the SKILL.md front matter rather than duplicated here.
 */
function frontMatterField(markdown, field) {
    const frontMatter = markdown.match(/^---\n([\s\S]*?)\n---/);
    if (!frontMatter) throw new Error('SKILL.md has no front matter block');
    const line = frontMatter[1].match(new RegExp(`^${field}:\\s*(.+)$`, 'm'));
    if (!line) throw new Error(`SKILL.md front matter has no ${field}`);
    return line[1].trim();
}

function readSkills() {
    const entries = fs
        .readdirSync(SKILLS_DIR, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .sort((a, b) => a.name.localeCompare(b.name));

    return entries.map((entry) => {
        const file = path.join(SKILLS_DIR, entry.name, 'SKILL.md');
        if (!fs.existsSync(file)) throw new Error(`${entry.name}/ has no SKILL.md`);

        // Hashed as bytes, not as a decoded string: the digest has to describe
        // what a client downloads.
        const contents = fs.readFileSync(file);
        const markdown = contents.toString('utf8');

        const name = frontMatterField(markdown, 'name');
        if (name !== entry.name) {
            throw new Error(`${entry.name}/SKILL.md declares name "${name}"; it must match its directory`);
        }
        if (!/^[a-z0-9-]+$/.test(name)) {
            throw new Error(`skill name "${name}" must be lowercase alphanumeric and hyphens`);
        }

        return {
            name,
            type: 'skill-md',
            description: frontMatterField(markdown, 'description'),
            url: `${SITE_ORIGIN}/.well-known/agent-skills/${name}/SKILL.md`,
            digest: `sha256:${crypto.createHash('sha256').update(contents).digest('hex')}`
        };
    });
}

const index = { $schema: SCHEMA, skills: readSkills() };
const serialised = `${JSON.stringify(index, null, 4)}\n`;

if (checkOnly) {
    const current = fs.existsSync(INDEX_FILE) ? fs.readFileSync(INDEX_FILE, 'utf8') : '';
    if (current === serialised) {
        console.log(`agent-skills index is up to date (${index.skills.length} skill${index.skills.length === 1 ? '' : 's'})`);
        process.exitCode = 0;
    } else {
        console.log('agent-skills index is out of date. Run:\n\n   yarn skills:build\n');
        process.exitCode = 1;
    }
} else {
    fs.writeFileSync(INDEX_FILE, serialised);
    console.log(`wrote ${path.relative(ROOT, INDEX_FILE)}`);
    index.skills.forEach((skill) => console.log(`   ${skill.name}  ${skill.digest}`));
}
