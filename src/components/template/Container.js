// Dependencies
import React from 'react';
import PropTypes from 'prop-types';

// Stylesheets
import style from 'components/template/Container.module.scss';

class Container extends React.Component {
  render() {
    return (<div className={`${style.container} ${this.props.blur ? style.blur : ''}`}>
      {this.props.children}
    </div>)
  }
};


Container.propTypes = {
  blur: PropTypes.bool,
};

Container.defaultProps = {
  blur: false
};

export default Container;
