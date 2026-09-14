import type { ProductEquipmentLink } from "types/content";
import productsEquipmentJson from "./products/data/productsEquipment.json";

/*
 * Which products came out of which piece of equipment.
 *
 * Kept as its own mapping rather than derived from the equipment links already
 * in each product's description, because those links carry three different
 * relationships and nothing in the text distinguishes them. StyloPoly links to
 * the Stylophone it samples and to the two pedals it was recorded through;
 * SidStation ASID links to hardware it drives and does not sample at all.
 * Deriving "sampled" from any link would state all three as the same thing.
 *
 * Shaped after data/releasesInstruments, which joins releases to equipment the
 * same way, for the same reason: the fact belongs to the pair, not to either
 * side of it.
 */
const productsEquipment: ProductEquipmentLink[] = productsEquipmentJson as ProductEquipmentLink[];

export default productsEquipment;
