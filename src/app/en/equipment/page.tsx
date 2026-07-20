import { EquipmentPage, getEquipmentPageMetadata } from 'components/pages/equipment';

export const metadata = getEquipmentPageMetadata('en');

export default function Page() {
    return <EquipmentPage lang="en" />;
}
