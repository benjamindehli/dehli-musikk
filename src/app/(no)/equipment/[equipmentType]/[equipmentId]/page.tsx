import { EquipmentItemPage, getEquipmentItemMetadata, getEquipmentItemStaticParams } from 'components/pages/equipment';

type Props = { params: Promise<{ equipmentType: string; equipmentId: string }> };

export function generateStaticParams() {
    return getEquipmentItemStaticParams();
}

export function generateMetadata(props: Props) {
    return getEquipmentItemMetadata('no', props);
}

export default function Page({ params }: Props) {
    return <EquipmentItemPage lang="no" params={params} />;
}
