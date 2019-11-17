// Dependencies
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router-dom';

// Stylesheets
import style from './NavigationBar.module.scss';

class NavigationBar extends Component {

  componentDidMount() {
  }


  render() {
    return (<div>
      Navbar
    </div>)
  }
}

const mapStateToProps = null;

const mapDispatchToProps = null;

export default connect(mapStateToProps, mapDispatchToProps)(NavigationBar);
