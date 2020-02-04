// Dependencies
import React from 'react';
import PropTypes from 'prop-types';

// Stylesheets
import style from 'components/partials/Modal.module.scss';

class Modal extends React.Component {

  constructor(props) {
    super(props);
    this.state = {};
    this.setWrapperRef = this.setWrapperRef.bind(this);
    this.handleClickOutside = this.handleClickOutside.bind(this);
  }

  componentDidMount() {
    document.addEventListener('mousedown', this.handleClickOutside);
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.handleClickOutside);
  }

  setWrapperRef(node) {
    this.wrapperRef = node;
  }

  handleClickOutside(event) {
    if (this.wrapperRef && !this.wrapperRef.contains(event.target)) {
      this.props.onClickOutside();
    }
  }

  render() {
    return (<div className={style.postModalOverlay}>
      <div ref={this.setWrapperRef} className={style.postModalContent} style={{maxWidth: this.props.maxWidth}}>{this.props.children}</div>
    </div>)
  }
};

Modal.propTypes = {
  maxWidth: PropTypes.string,
  onClickOutside: PropTypes.func.isRequired
};

Modal.defaultProps = {
  maxWidth: 'none'
};

export default Modal;
