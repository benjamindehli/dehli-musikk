import instrumentItems from "./equipment/data/instruments.json";
import effectItems from "./equipment/data/effects.json";
import amplifierItems from "./equipment/data/amplifiers.json";
import type { Lang } from "lib/pageMetadata";

/* The three types are a closed set: each one is a route segment with its own
 * page, its own thumbnail crops under /data/equipment/web/, and an entry in
 * VALID_EQUIPMENT_TYPES. Adding a fourth means adding all of those too. */
export type EquipmentTypeKey = "instruments" | "effects" | "amplifiers";

export type EquipmentItemData = {
    brand: string;
    model: string;
};

export type EquipmentType = {
    equipmentType: EquipmentTypeKey;
    items: EquipmentItemData[];
    name: Record<Lang, string>;
};

export const instruments: EquipmentType = {
    equipmentType: "instruments",
    items: instrumentItems,
    name: {
        en: "Instruments",
        no: "Instrumenter"
    }
};

export const effects: EquipmentType = {
    equipmentType: "effects",
    items: effectItems,
    name: {
        en: "Effects",
        no: "Effekter"
    }
};

export const amplifiers: EquipmentType = {
    equipmentType: "amplifiers",
    items: amplifierItems,
    name: {
        en: "Amplifiers",
        no: "Forsterkere"
    }
};

const equipment: Record<EquipmentTypeKey, EquipmentType> = {
    instruments,
    effects,
    amplifiers
};

export const EQUIPMENT_TYPE_KEYS = Object.keys(equipment) as EquipmentTypeKey[];

/*
 * Callers reach this with a route segment, i.e. an arbitrary string, so the
 * lookup has to answer "not a type" rather than assume. hasOwnProperty rather
 * than `equipment[key]` because a plain index would resolve inherited names:
 * "constructor" would come back truthy and then fail on .items further down.
 */
export const getEquipmentType = (key: string): EquipmentType | undefined =>
    Object.prototype.hasOwnProperty.call(equipment, key) ? equipment[key as EquipmentTypeKey] : undefined;

export default equipment;
