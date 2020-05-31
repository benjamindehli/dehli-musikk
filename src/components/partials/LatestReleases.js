// Dependencies
import React, {Component} from 'react';
import {connect} from 'react-redux';

// Components
import Release from 'components/partials/Portfolio/Release';

// Template
import List from 'components/template/List';
import ListItem from 'components/template/List/ListItem';

// Data
import {latestReleases} from 'data/portfolio';


class LatestReleases extends Component {

  renderReleases() {
    return latestReleases && latestReleases.length
      ? latestReleases.map(release => {
        return (<ListItem key={release.id}>
            <Release release={release} />
          </ListItem>)
      })
      : '';
  }

  render() {
    return (<List>
        {this.renderReleases()}
    </List>)
  }
}

export default connect(null, null)(LatestReleases);
