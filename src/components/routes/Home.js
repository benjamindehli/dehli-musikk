// Dependencies
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router-dom';

// Stylesheets
import style from './Home.module.scss';

class Home extends Component {

  componentDidMount() {
  }


  render() {
    return (<div>
      <h1>Home</h1>
    </div>)
  }
}

const mapStateToProps = null;

const mapDispatchToProps = null;

export default connect(mapStateToProps, mapDispatchToProps)(Home);
