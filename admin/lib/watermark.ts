import sharp, { type OverlayOptions } from "sharp";

/*
 * The watermark the hand-exported photos carry on their larger sizes:
 * "Benjamin Dehli / www.dehlimusikk.no" bottom left in white Helvetica with a
 * black shadow, and the logo bottom right in black at 70% opacity.
 *
 * Every measure is a fraction of the image width, taken from the existing
 * 540 and 945 files (which agree to within a pixel), so the watermark keeps
 * the same proportions at any size.
 *
 * Plain sharp and no Next.js imports, so a one-off script can use it too.
 */

const TEXT_SIZE = 0.0296;
const TEXT_LEFT = 0.0204;
/** From the bottom edge to the baseline of the second line. */
const TEXT_BASELINE = 0.0365;
const LOGO_WIDTH = 0.149;
const LOGO_RIGHT = 0.019;
const LOGO_BOTTOM = 0.0205;
const LOGO_OPACITY = 0.7;
const SHADOW = 0.0012;

/** The sizes below this width are too small for a readable watermark, and never had one. */
export const WATERMARK_MIN_WIDTH = 540;

const logoCache = new Map<string, Promise<Buffer>>();

/* The logo trimmed to its ink, so its placement does not depend on the SVG's padding. */
function trimmedLogo(logoSvg: Buffer, width: number): Promise<Buffer> {
    const key = `${width}`;
    let logo = logoCache.get(key);
    if (!logo) {
        logo = sharp(logoSvg, { density: 600 })
            .trim()
            .resize({ width })
            .ensureAlpha()
            .raw()
            .toBuffer({ resolveWithObject: true })
            .then(({ data, info }) => {
                for (let i = 3; i < data.length; i += 4) data[i] = Math.round(data[i] * LOGO_OPACITY);
                return sharp(data, { raw: info }).png().toBuffer();
            });
        logoCache.set(key, logo);
    }
    return logo;
}

const escapeXml = (text: string) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;");

/** Composite layers for sharp's composite(): the text and the logo, for an image of this size. */
export async function watermarkLayers(width: number, height: number, logoSvg: Buffer): Promise<OverlayOptions[]> {
    const size = width * TEXT_SIZE;
    const left = width * TEXT_LEFT;
    const second = height - width * TEXT_BASELINE;
    const shadow = width * SHADOW;
    const lines = ["Benjamin Dehli", "www.dehlimusikk.no"];
    const text = lines.map((line, i) => `<text x="${left}" y="${second - (lines.length - 1 - i) * size}">${escapeXml(line)}</text>`).join("");
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
        <filter id="s" x="-10%" y="-10%" width="120%" height="140%"><feDropShadow dx="${shadow}" dy="${shadow}" stdDeviation="${shadow}" flood-color="#000" flood-opacity="0.9"/></filter>
        <g font-family="Helvetica, 'Liberation Sans', Arial, sans-serif" font-size="${size}" fill="#fff" filter="url(#s)">${text}</g>
    </svg>`;

    const logo = await trimmedLogo(logoSvg, Math.round(width * LOGO_WIDTH));
    const logoInfo = await sharp(logo).metadata();
    return [
        { input: Buffer.from(svg), left: 0, top: 0 },
        {
            input: logo,
            left: Math.round(width - width * LOGO_RIGHT - logoInfo.width!),
            top: Math.round(height - width * LOGO_BOTTOM - logoInfo.height!)
        }
    ];
}
