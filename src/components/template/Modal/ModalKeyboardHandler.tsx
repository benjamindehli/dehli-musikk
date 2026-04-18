'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Props {
    listPath: string;
    arrowLeftLink?: string | null;
    arrowRightLink?: string | null;
}

const ModalKeyboardHandler = ({ listPath, arrowLeftLink, arrowRightLink }: Props) => {
    const router = useRouter();

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            switch (event.key) {
                case 'Escape':
                    router.push(listPath);
                    break;
                case 'ArrowLeft':
                case 'ArrowUp':
                    if (arrowLeftLink) router.push(arrowLeftLink);
                    break;
                case 'ArrowRight':
                case 'ArrowDown':
                    if (arrowRightLink) router.push(arrowRightLink);
                    break;
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [listPath, arrowLeftLink, arrowRightLink, router]);

    return null;
};

export default ModalKeyboardHandler;
