// Dependencies
import React from 'react';

// Stylesheets
import style from 'components/template/List.module.scss';

class List extends React.Component {
  render() {
    return (<div className={style.list}>
      {this.props.children}
    </div>)
  }
};

export default List;
