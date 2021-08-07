// Dependencies
import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// Stylesheets
import style from 'components/template/Modal.module.scss';

class Modal extends React.Component {

  constructor(props) {
    super(props);
    this.state = {};
    this.setWrapperRef = this.setWrapperRef.bind(this);
    this.setHiddenInputWrapperRef = this.setHiddenInputWrapperRef.bind(this);
    this.setArrowLeftButtonRef = this.setArrowLeftButtonRef.bind(this);
    this.setArrowRightButtonRef = this.setArrowRightButtonRef.bind(this);
    this.handleClickOutside = this.handleClickOutside.bind(this);
    this.keyDownFunction = this.keyDownFunction.bind(this);
  }

  componentDidMount() {
    document.addEventListener('mousedown', this.handleClickOutside);
    document.addEventListener("keydown", this.keyDownFunction, false);
    this.hiddenInputWrapperRef.tabIndex = -1;
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.handleClickOutside);
    document.removeEventListener("keydown", this.keyDownFunction, false);
  }

  keyDownFunction(event) {
    switch (event.keyCode) {
      case 27: // Escape
        if (this.props.onClickOutside) this.props.onClickOutside();
        break;
      case 37: // ArrowLeft
        if (this.props.onClickArrowLeft) this.props.onClickArrowLeft();
        break;
      case 38: // ArrowUp
        if (this.props.onClickArrowLeft) this.props.onClickArrowLeft();
        break;
      case 39: // ArrowRight
        if (this.props.onClickArrowRight) this.props.onClickArrowRight();
        break;
      case 40: // ArrowDown
        if (this.props.onClickArrowRight) this.props.onClickArrowRight();
        break;
      default:
        return null;
    }
  }

  setWrapperRef(node) {
    this.wrapperRef = node;
  }

  setHiddenInputWrapperRef(node) {
    this.hiddenInputWrapperRef = node;
  }

  setArrowLeftButtonRef(node) {
    this.arrowLeftButtonRef = node;
  }

  setArrowRightButtonRef(node) {
    this.arrowRightButtonRef = node;
  }



  handleClickOutside(event) {
    const isArrowLeftButtonClick = this.arrowLeftButtonRef && this.arrowLeftButtonRef.contains(event.target);
    const isArrowRightButtonClick = this.arrowRightButtonRef && this.arrowRightButtonRef.contains(event.target);
    if (this.wrapperRef && !this.wrapperRef.contains(event.target) && !isArrowLeftButtonClick && !isArrowRightButtonClick) {
      this.props.onClickOutside();
    }
  }

  renderArrowLeftButton(onClickFunction) {
    return onClickFunction
      ? (<button ref={this.setArrowLeftButtonRef} aria-label={this.props.selectedLanguageKey === 'en' ? 'Previous' : 'Forrige'} className={style.arrowLeftButton} onClick={() => onClickFunction()}>
        <FontAwesomeIcon icon={['fas', 'chevron-left']} size="2x" />
      </button>)
      : (<div className={style.arrowPlaceholderButton}></div>);
  }

  renderArrowRightButton(onClickFunction) {
    return onClickFunction
      ? (<button ref={this.setArrowRightButtonRef} aria-label={this.props.selectedLanguageKey === 'en' ? 'Next' : 'Neste'} className={style.arrowRightButton} onClick={() => onClickFunction()}>
        <FontAwesomeIcon icon={['fas', 'chevron-right']} size="2x" />
      </button>)
      : (<div className={style.arrowPlaceholderButton}></div>);
  }

  render() {
    return (<div className={style.postModalOverlay}>
      {this.renderArrowLeftButton(this.props.onClickArrowLeft)}
      <div ref={this.setWrapperRef} className={style.postModalContent} style={{ maxWidth: this.props.maxWidth }}>
        <input type="button" ref={this.setHiddenInputWrapperRef} className={style.hidden} autoFocus />
        {this.props.children}
      </div>
      {this.renderArrowRightButton(this.props.onClickArrowRight)}
    </div>)
  }
};

Modal.propTypes = {
  maxWidth: PropTypes.string,
  selectedLanguageKey: PropTypes.string,
  onClickOutside: PropTypes.func.isRequired,
  onClickArrowLeft: PropTypes.func,
  onClickArrowRight: PropTypes.func
};

Modal.defaultProps = {
  maxWidth: 'none',
  selectedLanguageKey: 'no'
};

export default Modal;
