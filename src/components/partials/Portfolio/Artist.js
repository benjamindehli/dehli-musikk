// Dependencies
import React, {Component} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';

// Components
import {withFirebase} from '../../Firebase';
import Release from './Release';

class Artist extends Component {
  constructor(props) {
    super(props);
    this.state = {
      releases: {}
    };
  }

  componentDidMount() {
    this.getReleasesByArtist(this.props.artist.id);
  }

  getReleasesByArtist(artistId) {
    this.props.firebase.getReleasesByArtistId(artistId).then(releasesByArtist => {
      this.setState({releases: releasesByArtist})
    });
  }

  renderReleases(artist) {
    return this.state.releases && this.state.releases.length
      ? this.state.releases.map(release => {
        return <Release key={release.id} release={release} artist={artist} viewType={this.props.viewType}/>
      })
      : '';
  }

  render() {
    return (<React.Fragment>
      {this.renderReleases(this.props.artist)}
    </React.Fragment>);
  }
}

Artist.propTypes = {
  artist: PropTypes.object.isRequired,
  viewType: PropTypes.string
};

Release.defaultProps = {
  viewType: 'list'
}

const mapStateToProps = null;

const mapDispatchToProps = null;

export default connect(mapStateToProps, mapDispatchToProps)(withFirebase(Artist));
