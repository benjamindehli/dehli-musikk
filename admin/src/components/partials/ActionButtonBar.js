// Dependencies
import React, {Component} from 'react';
import {connect} from 'react-redux';

// Stylesheets
import style from 'components/partials/ActionButtonBar.module.scss';

class ActionButtonBar extends Component {
  render() {
    return (<div className={style.actionButtonBar}>
        {this.props.children}
    </div>)
  }
}

export default connect(null, null)(ActionButtonBar);
