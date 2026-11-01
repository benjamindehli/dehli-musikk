import type { EquipmentTypeKey } from "data/equipment";

export type EquipmentItem = { brand: string; model: string };

export const EQUIPMENT_TYPES: Record<EquipmentTypeKey, { singular: string; plural: string }> = {
    instruments: { singular: "Instrument", plural: "Instruments" },
    effects: { singular: "Effect", plural: "Effects" },
    amplifiers: { singular: "Amplifier", plural: "Amplifiers" }
};

export function isEquipmentType(value: string): value is EquipmentTypeKey {
    return Object.hasOwn(EQUIPMENT_TYPES, value);
}
