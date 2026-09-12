/*
 * Proves a .js -> .ts conversion changed nothing but types.
 *
 * TypeScript erases type annotations, so a conversion that only adds them must
 * transpile back to the original JavaScript. This strips the types from the
 * converted file and compares the result against the .js it replaced, taken
 * from git. Anything that survives the comparison is a runtime change, which
 * is either a deliberate fix or a mistake - either way it has to be looked at
 * rather than assumed.
 *
 * Usage: node scripts/verify-type-erasure.mjs <ref> <file.ts> [file.ts...]
 *   ref: the git ref holding the original .js files (e.g. HEAD)
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

const [ref, ...files] = process.argv.slice(2);
if (!ref || !files.length) {
    console.error("usage: node scripts/verify-type-erasure.mjs <git-ref> <file.ts...>");
    process.exit(2);
}

/* Formatting is not behaviour: both sides are run through the same printer so
 * that re-indenting a wrapped argument list does not read as a difference. */
const normalise = (source, fileName) => {
    const stripped = ts.transpileModule(source, {
        fileName,
        compilerOptions: {
            target: ts.ScriptTarget.ESNext,
            module: ts.ModuleKind.ESNext,
            jsx: fileName.endsWith(".tsx") ? ts.JsxEmit.Preserve : undefined,
            removeComments: true,
            newLine: ts.NewLineKind.LineFeed
        }
    }).outputText;
    /*
     * Reduced to a walk of its syntax tree. Comparing text does not work: the
     * printer re-wraps statements according to how the source happened to be
     * laid out, so `.filter(x)\n.map(y)` and `.filter(x).map(y)` differ as
     * strings while being the same program. Collapsing whitespace instead would
     * corrupt string literals, where the spacing is the content, and a raw token
     * scan mis-reads template literals - after the `}` closing a substitution it
     * does not know it is still inside the template, and swallows the rest of
     * the file. The parser gets all of that right, so the tree is what we
     * compare: node kinds in order, plus the exact text of every leaf that
     * carries one.
     */
    const parsed = ts.createSourceFile(fileName.replace(/\.tsx?$/, ".js"), stripped, ts.ScriptTarget.ESNext, /* setParentNodes */ false);
    const nodes = [];
    const walk = (node) => {
        /*
         * Parentheses are a node in the tree but not a difference in the
         * program, and a formatter is free to add or drop redundant ones.
         * Descending through without recording keeps reformatting from reading
         * as a behaviour change.
         */
        if (node.kind === ts.SyntaxKind.ParenthesizedExpression) {
            ts.forEachChild(node, walk);
            return;
        }
        let entry = String(node.kind);
        // Identifiers, literals and template chunks carry meaning in their text.
        if (node.text !== undefined) entry += `:${node.text}`;
        /*
         * var/let/const share one node kind and differ only in flags, so without
         * this a `var` rewritten to `let` - a real change to scoping and
         * hoisting - would compare equal.
         */
        if (node.kind === ts.SyntaxKind.VariableDeclarationList) {
            const kind = node.flags & ts.NodeFlags.Const ? "const" : node.flags & ts.NodeFlags.Let ? "let" : "var";
            entry += `:${kind}`;
        }
        nodes.push(entry);
        ts.forEachChild(node, walk);
    };
    ts.forEachChild(parsed, walk);
    return nodes;
};

/** The first place two token streams diverge, with surrounding context. */
const text = (tokens) => tokens.map((token) => token.slice(token.indexOf(":") + 1)).join(" ");

const firstDifference = (a, b) => {
    let i = 0;
    while (i < a.length && i < b.length && a[i] === b[i]) i++;
    const from = Math.max(0, i - 10);
    return {
        before: `...${text(a.slice(from, i + 12))}`,
        after: `...${text(b.slice(from, i + 12))}`
    };
};

let failed = 0;
let skipped = 0;
for (const file of files) {
    const original = path.join(path.dirname(file), path.basename(file).replace(/\.tsx?$/, ".js"));
    let before;
    try {
        // -c safe.directory so a repo owned by another uid still reads. Without
        // it git exits non-zero, every file "skips", and a check that verified
        // nothing reports success.
        before = execFileSync("git", ["-c", `safe.directory=${process.cwd()}`, "show", `${ref}:${original}`], {
            encoding: "utf8",
            stdio: ["ignore", "pipe", "pipe"]
        });
    } catch (error) {
        skipped++;
        console.log(`SKIP  ${file} (could not read ${original} at ${ref}: ${String(error.stderr || error.message).trim()})`);
        continue;
    }
    const after = fs.readFileSync(file, "utf8");
    const a = normalise(before, original);
    const b = normalise(after, file);
    if (a.length === b.length && a.every((token, i) => token === b[i])) {
        console.log(`SAME  ${file}`);
        continue;
    }
    failed++;
    const difference = firstDifference(a, b);
    console.log(`DIFF  ${file}`);
    console.log(`      - ${difference.before}`);
    console.log(`      + ${difference.after}`);
}

/* A skip means nothing was compared, so it fails too: the whole point is to
 * know the conversion was checked, not to be told it was fine by a run that
 * read no files. */
if (failed) console.log(`\n${failed} file(s) differ beyond type erasure - review each.`);
if (skipped) console.log(`\n${skipped} file(s) could not be compared. Nothing was verified for those.`);
if (!failed && !skipped) console.log(`\nAll ${files.length} file(s) are annotation-only changes.`);
process.exit(failed || skipped ? 1 : 0);
