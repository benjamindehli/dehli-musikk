// Dependencies
import { useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// Stylesheets
import style from 'components/template/Modal.module.scss';

const Modal = ({ maxWidth = 'none', selectedLanguageKey = 'no', onClickOutside, onClickArrowLeft, onClickArrowRight, children }) => {

  // Refs
  const wrapperRef = useRef();
  const hiddenInputWrapperRef = useRef();
  const arrowLeftButtonRef = useRef();
  const arrowRightButtonRef = useRef();


  useEffect(() => {
    hiddenInputWrapperRef.current.tabIndex = -1;
  }, [])


  useEffect(() => {
    const handleClickOutside = (event) => {
      const isArrowLeftButtonClick = arrowLeftButtonRef?.current?.contains(event.target);
      const isArrowRightButtonClick = arrowRightButtonRef?.current?.contains(event.target);
      if (wrapperRef.current && !wrapperRef.current.contains(event.target) && !isArrowLeftButtonClick && !isArrowRightButtonClick) {
        onClickOutside();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClickOutside]);

  useEffect(() => {
    const keyDownFunction = (event) => {
      switch (event.keyCode) {
        case 27: // Escape
          if (onClickOutside) onClickOutside();
          break;
        case 37: // ArrowLeft
          if (onClickArrowLeft) onClickArrowLeft();
          break;
        case 38: // ArrowUp
          if (onClickArrowLeft) onClickArrowLeft();
          break;
        case 39: // ArrowRight
          if (onClickArrowRight) onClickArrowRight();
          break;
        case 40: // ArrowDown
          if (onClickArrowRight) onClickArrowRight();
          break;
        default:
          return null;
      }
    }
    document.addEventListener("keydown", keyDownFunction, false);
    return () => {
      document.removeEventListener("keydown", keyDownFunction, false);
    };
  }, [onClickOutside, onClickArrowLeft, onClickArrowRight]);

  const renderArrowLeftButton = (onClickFunction) => {
    return onClickFunction
      ? (<button ref={arrowLeftButtonRef} aria-label={selectedLanguageKey === 'en' ? 'Previous' : 'Forrige'} className={style.arrowLeftButton} onClick={onClickFunction}>
        <FontAwesomeIcon icon={['fas', 'chevron-left']} size="2x" />
      </button>)
      : (<div className={style.arrowPlaceholderButton}></div>);
  }

  const renderArrowRightButton = (onClickFunction) => {
    return onClickFunction
      ? (<button ref={arrowRightButtonRef} aria-label={selectedLanguageKey === 'en' ? 'Next' : 'Neste'} className={style.arrowRightButton} onClick={onClickFunction}>
        <FontAwesomeIcon icon={['fas', 'chevron-right']} size="2x" />
      </button>)
      : (<div className={style.arrowPlaceholderButton}></div>);
  }

  return (
    <div className={style.postModalOverlay}>
      {renderArrowLeftButton(onClickArrowLeft)}
      <div ref={wrapperRef} className={style.postModalContent} style={{ maxWidth: maxWidth }}>
        <input type="button" ref={hiddenInputWrapperRef} className={style.hidden} autoFocus />
        {children}
      </div>
      {renderArrowRightButton(onClickArrowRight)}
    </div>
  )
};

export default Modal;
