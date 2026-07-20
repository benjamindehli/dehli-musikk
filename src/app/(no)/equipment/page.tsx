import { EquipmentPage, getEquipmentPageMetadata } from 'components/pages/equipment';

export const metadata = getEquipmentPageMetadata('no');

export default function Page() {
    return <EquipmentPage lang="no" />;
}
