import React from 'react';
import PropTypes from 'prop-types';
import style from './Button.module.scss';

class Button extends React.Component {
  render() {
    return (<button {...this.props} className={`${style.button} ${style[this.props.buttontype]}`}>
      {this.props.children}
    </button>)
  }
};

Button.propTypes = {
  buttontype: PropTypes.oneOf(['minimal', 'default'])
};

Button.defaultProps = {
  buttontype: 'default'
};

export default Button;
