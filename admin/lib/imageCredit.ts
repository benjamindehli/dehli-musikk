import sharp from "sharp";

type SharpImage = ReturnType<typeof sharp>;

/*
 * The credit the hand-exported jpegs of Dehli Musikk's own photos carry, so
 * that search engines (Google Images shows creator, credit and copyright
 * notice) and anyone saving the image can see whose it is. Written the way
 * the old converter wrote it, in all three places readers look:
 *
 * - XMP and IPTC: creator, credit, copyright notice and the city.
 * - EXIF: the studio's position in Bø, which the old files have too.
 *
 * jpeg only, as before; the webp and avif files carry no metadata.
 *
 * Plain sharp and no Next.js imports, so a one-off script can use it too.
 */

const CREATOR = "Benjamin Dehli";
const CREDIT = "Dehli Musikk";
const CITY = "Bø";
const STATE = "Midt-Telemark";
const COUNTRY = "Norway";
const COUNTRY_CODE = "NOR";

const notice = (year: number) => `© ${year} ${CREATOR} www.dehlimusikk.no`;

function xmp(year: number): string {
    return `<?xpacket begin="﻿" id="W5M0MpCehiHzreSzNTczkc9d"?>
<x:xmpmeta xmlns:x="adobe:ns:meta/">
 <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
  <rdf:Description rdf:about=""
    xmlns:Iptc4xmpCore="http://iptc.org/std/Iptc4xmpCore/1.0/xmlns/"
    xmlns:dc="http://purl.org/dc/elements/1.1/"
    xmlns:photoshop="http://ns.adobe.com/photoshop/1.0/">
   <Iptc4xmpCore:CountryCode>${COUNTRY_CODE}</Iptc4xmpCore:CountryCode>
   <dc:creator><rdf:Seq><rdf:li>${CREATOR}</rdf:li></rdf:Seq></dc:creator>
   <dc:rights><rdf:Alt><rdf:li xml:lang="x-default">${notice(year)}</rdf:li></rdf:Alt></dc:rights>
   <photoshop:City>${CITY}</photoshop:City>
   <photoshop:Country>${COUNTRY}</photoshop:Country>
   <photoshop:Credit>${CREDIT}</photoshop:Credit>
   <photoshop:State>${STATE}</photoshop:State>
  </rdf:Description>
 </rdf:RDF>
</x:xmpmeta>
<?xpacket end="w"?>`;
}

/* 59°26'44.69"N 9°05'03.71"E, 193.1 m, as in the existing files. */
const EXIF = {
    IFD3: {
        GPSLatitudeRef: "N",
        GPSLatitude: "59/1 26/1 4469/100",
        GPSLongitudeRef: "E",
        GPSLongitude: "9/1 5/1 371/100",
        GPSAltitudeRef: "0",
        GPSAltitude: "1931/10"
    }
};

/* One IPTC IIM dataset: 0x1C, record, dataset, length, value. */
function dataset(record: number, number: number, value: string | Buffer): Buffer {
    const bytes = typeof value === "string" ? Buffer.from(value, "utf8") : value;
    const header = Buffer.from([0x1c, record, number, bytes.length >> 8, bytes.length & 0xff]);
    return Buffer.concat([header, bytes]);
}

/* The APP13 segment: a Photoshop 3.0 resource block holding the IPTC record (resource 0x0404). */
function iptcSegment(year: number): Buffer {
    const iim = Buffer.concat([
        dataset(1, 90, Buffer.from([0x1b, 0x25, 0x47])), // character set: UTF-8
        dataset(2, 80, CREATOR),
        dataset(2, 90, CITY),
        dataset(2, 95, STATE),
        dataset(2, 100, COUNTRY_CODE),
        dataset(2, 101, COUNTRY),
        dataset(2, 110, CREDIT),
        dataset(2, 116, notice(year))
    ]);
    const padded = iim.length % 2 ? Buffer.concat([iim, Buffer.from([0])]) : iim;
    const resource = Buffer.concat([
        Buffer.from("8BIM", "latin1"),
        Buffer.from([0x04, 0x04, 0, 0]), // id 0x0404, empty name padded to even
        Buffer.from([padded.length >>> 24, (padded.length >>> 16) & 0xff, (padded.length >>> 8) & 0xff, padded.length & 0xff]),
        padded
    ]);
    const body = Buffer.concat([Buffer.from("Photoshop 3.0\0", "latin1"), resource]);
    return Buffer.concat([Buffer.from([0xff, 0xed, (body.length + 2) >> 8, (body.length + 2) & 0xff]), body]);
}

/** Adds the EXIF and XMP to a jpeg encoder; pair with withIptc on its output. */
export function withCredit(image: SharpImage, year: number): SharpImage {
    return image.withExif(EXIF).withXmp(xmp(year));
}

/*
 * sharp has no IPTC writer, so the segment goes in by hand: after the
 * APP0/APP1 segments at the start of the file, where readers expect it.
 */
export function withIptc(jpeg: Buffer, year: number): Buffer {
    let offset = 2;
    while (offset + 4 <= jpeg.length && jpeg[offset] === 0xff && jpeg[offset + 1] >= 0xe0 && jpeg[offset + 1] <= 0xef) {
        offset += 2 + jpeg.readUInt16BE(offset + 2);
    }
    return Buffer.concat([jpeg.subarray(0, offset), iptcSegment(year), jpeg.subarray(offset)]);
}

/** The year in an existing file's copyright notice, so a regenerated set keeps it. */
export async function creditYear(file: string | Buffer): Promise<number | undefined> {
    try {
        const { xmp: packet } = await sharp(file).metadata();
        const year = packet?.toString("utf8").match(/© (\d{4}) Benjamin Dehli/)?.[1];
        return year ? Number(year) : undefined;
    } catch {
        return undefined;
    }
}
