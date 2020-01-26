// Dependencies
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Helmet} from 'react-helmet';


class NotFound extends Component {
  render() {
    return (<div>
      <Helmet>
        <title>404 - Siden finnes ikke - Dehli Musikk</title>
      </Helmet>
      <h1>404 - Siden finnes ikke</h1>
    </div>)
  }
}

export default connect(null, null)(NotFound);
