import { EquipmentTypePage, getEquipmentTypeMetadata, getEquipmentTypeStaticParams } from 'components/pages/equipment';

type Props = { params: Promise<{ equipmentType: string }> };

export function generateStaticParams() {
    return getEquipmentTypeStaticParams();
}

export function generateMetadata(props: Props) {
    return getEquipmentTypeMetadata('en', props);
}

export default function Page({ params }: Props) {
    return <EquipmentTypePage lang="en" params={params} />;
}
