// Dependencies
import React, {Component} from 'react';
import {connect} from 'react-redux';

class NotFound extends Component {
  render() {
    return (<div>
      <h1>Siden finnes ikke</h1>
    </div>)
  }
}

export default connect(null, null)(NotFound);
