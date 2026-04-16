import Link from 'next/link';
import ModalKeyboardHandler from 'components/template/Modal/ModalKeyboardHandler';
import style from 'components/template/Modal.module.scss';

interface ModalProps {
    isTheaterMode?: boolean;
    maxWidth?: string;
    lang?: string;
    listPath: string;
    arrowLeftLink?: string | null;
    arrowRightLink?: string | null;
    children: React.ReactNode;
}

const Modal = ({
    isTheaterMode = false,
    maxWidth = 'none',
    lang = 'no',
    listPath,
    arrowLeftLink,
    arrowRightLink,
    children
}: ModalProps) => {
    const overlayClasses = [style.postModalOverlay, isTheaterMode && style.theaterMode]
        .filter(Boolean).join(' ');
    const contentClasses = [style.postModalContent, isTheaterMode && style.theaterMode]
        .filter(Boolean).join(' ');

    return (
        <div className={overlayClasses}>
            <ModalKeyboardHandler listPath={listPath} arrowLeftLink={arrowLeftLink} arrowRightLink={arrowRightLink} />
            <Link href={listPath} className={style.overlayClose} aria-label={lang === 'en' ? 'Close' : 'Lukk'} />
            {!isTheaterMode && (
                arrowLeftLink
                    ? <Link href={arrowLeftLink} aria-label={lang === 'en' ? 'Previous' : 'Forrige'} className={style.arrowLeftButton} rel="prev">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" aria-hidden="true" focusable="false" width="2em" height="2em">
                              <path fill="currentColor" d="M41.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.3 256 246.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z" />
                          </svg>
                      </Link>
                    : <div className={style.arrowPlaceholderButton} />
            )}
            <div className={contentClasses} style={{ maxWidth }}>
                {children}
            </div>
            {!isTheaterMode && (
                arrowRightLink
                    ? <Link href={arrowRightLink} aria-label={lang === 'en' ? 'Next' : 'Neste'} className={style.arrowRightButton} rel="next">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" aria-hidden="true" focusable="false" width="2em" height="2em">
                              <path fill="currentColor" d="M278.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-160 160c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L210.7 256 73.4 118.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l160 160z" />
                          </svg>
                      </Link>
                    : <div className={style.arrowPlaceholderButton} />
            )}
        </div>
    );
};

export default Modal;
