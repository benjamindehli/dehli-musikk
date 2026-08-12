'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useModalState } from 'lib/ModalContext';

interface Props {
    listPath: string;
    arrowLeftLink?: string | null;
    arrowRightLink?: string | null;
}

const ModalKeyboardHandler = ({ listPath, arrowLeftLink, arrowRightLink }: Props) => {
    const router = useRouter();
    const { registerModal } = useModalState();

    // Modal renders this on every detail page, so it is where the open state is
    // reported from; registerModal returns its own deregister function.
    useEffect(() => registerModal(), [registerModal]);

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
