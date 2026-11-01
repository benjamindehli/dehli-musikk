import Link from "next/link";
import { notFound } from "next/navigation";
import type { Product, ProductEquipmentLink } from "types/content";
import { convertToUrlFriendlyString } from "helpers/urlFormatter";
import { readDataFile } from "@admin/lib/dataFiles";
import { toOsloDate } from "@admin/lib/dates";
import { existingThumbnails } from "@admin/lib/thumbnails";
import ImagePanel from "@admin/components/ImagePanel";
import GalleryPanel from "./GalleryPanel";
import ProductForm, { type EquipmentChoice, type ProductFormValues } from "./ProductForm";

export const dynamic = "force-dynamic";

type GalleryManifest = Record<string, { base: string; widths: number[]; hash: string }>;

// The smallest encoded jpeg of a gallery image, or nothing until the encoder has run.
function galleryPreview(manifest: GalleryManifest, file: string): string | null {
    const entry = manifest[file];
    return entry ? `/preview/products/gallery/jpg/${entry.base}_${entry.widths[0]}.${entry.hash}.jpg` : null;
}

function formValues(product: Product | undefined, slug: string | null, links: ProductEquipmentLink[], manifest: GalleryManifest): ProductFormValues {
    return {
        slug,
        date: product ? toOsloDate(product.timestamp) : toOsloDate(Date.now()),
        lastmod: product?.lastmod ? toOsloDate(product.lastmod) : "",
        title: product?.title ?? "",
        contentNo: product?.content.no ?? "",
        contentEn: product?.content.en ?? "",
        thumbnailDescription: product?.thumbnailDescription ?? "",
        price: product?.price ?? "9.99",
        priceCurrency: product?.priceCurrency ?? "USD",
        linkUrl: product?.link.url ?? "",
        linkTextNo: product?.link.text.no ?? "Gå til side for nedlasting",
        linkTextEn: product?.link.text.en ?? "Go to download page",
        documentationUrl: product?.documentationLink?.url ?? "",
        documentationTextNo: product?.documentationLink?.text.no ?? "",
        documentationTextEn: product?.documentationLink?.text.en ?? "",
        sameAs: (product?.sameAs ?? []).join("\n"),
        productType: product?.productType ?? [],
        operatingSystem: product?.operatingSystem ?? "",
        formats: (product?.formats ?? []).map((format) => ({ name: format.name, operatingSystem: format.operatingSystem ?? "" })),
        license: product?.license ?? "",
        softwareVersion: product?.softwareVersion ?? "",
        fileSize: product?.fileSize ?? "",
        gallery: (product?.additionalImages ?? []).map((file) => ({
            file,
            preview: galleryPreview(manifest, file),
            captionNo: product?.additionalImageDescriptions?.[file]?.no ?? "",
            captionEn: product?.additionalImageDescriptions?.[file]?.en ?? ""
        })),
        videoUrl: product?.video?.contentUrl ?? "",
        videoUploadDate: product?.video?.uploadDate ?? "",
        videoNameNo: product?.video?.name.no ?? "",
        videoNameEn: product?.video?.name.en ?? "",
        videoDescriptionNo: product?.video?.description.no ?? "",
        videoDescriptionEn: product?.video?.description.en ?? "",
        equipment: links.filter((link) => link.productId === slug).map((link) => ({ equipmentId: link.equipmentId, relation: link.relation }))
    };
}

export default async function EditProductPage({
    params,
    searchParams
}: {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ created?: string }>;
}) {
    const { slug } = await params;
    const { created } = await searchParams;
    const [products, links, instruments, effects, amplifiers, galleryManifest] = await Promise.all([
        readDataFile<Product[]>("products"),
        readDataFile<ProductEquipmentLink[]>("productsEquipment"),
        readDataFile<{ brand: string; model: string }[]>("instruments"),
        readDataFile<{ brand: string; model: string }[]>("effects"),
        readDataFile<{ brand: string; model: string }[]>("amplifiers"),
        readDataFile<GalleryManifest>("productGallery")
    ]);
    const isNew = slug === "new";
    const product = isNew ? undefined : products.find((candidate) => convertToUrlFriendlyString(candidate.title) === slug);
    if (!isNew && !product) notFound();

    const equipment: EquipmentChoice[] = [
        ...instruments.map((item) => ({ item, type: "Instrument" })),
        ...effects.map((item) => ({ item, type: "Effect" })),
        ...amplifiers.map((item) => ({ item, type: "Amplifier" }))
    ]
        .map(({ item, type }) => ({ id: convertToUrlFriendlyString(`${item.brand} ${item.model}`), label: `${item.brand} ${item.model}`, type }))
        .sort((a, b) => a.label.localeCompare(b.label));
    const productTypes = [...new Set(products.flatMap((candidate) => candidate.productType))];
    const systems = [
        ...new Set(products.flatMap((candidate) => [candidate.operatingSystem, ...(candidate.formats ?? []).map((format) => format.operatingSystem)]))
    ].filter((system): system is string => Boolean(system));
    const formatNames = [...new Set(products.flatMap((candidate) => (candidate.formats ?? []).map((format) => format.name)))];

    return (
        <>
            <p>
                <Link href="/products/">All products</Link>
            </p>
            <h1>{product ? product.title : "New product"}</h1>
            {created ? <p className="admin-status admin-status-saved">Created. Add its image below.</p> : null}
            <ProductForm
                // Remounted when an image is added or encoded, so the gallery rows pick it up.
                // Sorted, so that saving a new order is not itself a change that remounts the
                // form and throws away the "Saved" it is about to show.
                key={`${slug}:${[...(product?.additionalImages ?? [])]
                    .sort()
                    .map((file) => `${file}${galleryManifest[file]?.hash ?? ""}`)
                    .join()}`}
                initial={formValues(product, isNew ? null : slug, links, galleryManifest)}
                equipment={equipment}
                productTypes={productTypes}
                systems={systems}
                formatNames={formatNames}
            />
            {product ? (
                <>
                    <ImagePanel
                        section="products"
                        itemKey={slug}
                        name={slug}
                        existing={await existingThumbnails("products", slug)}
                        originalFile={product.mainImage}
                    />
                    <GalleryPanel slug={slug} />
                </>
            ) : null}
        </>
    );
}
