// Dependencies
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Helmet } from 'react-helmet';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// Components
import ActionButtonBar from 'components/partials/ActionButtonBar';
import Release from 'components/partials/Release';

// Actions
import { createRelease, updateReleases } from 'actions/ReleasesActions';

// Helpers
import { updatePropertyInArray } from 'helpers/objectHelpers';
import { fetchReleaseData, renderFileName } from 'helpers/releaseHelpers';
import { convertToUrlFriendlyString } from 'helpers/urlFormatter'

// Stylesheets
import style from 'components/routes/Dashboard.module.scss';
import commonStyle from 'components/partials/commonStyle.module.scss';

class Portfolio extends Component {
  constructor(props) {
    super(props);
    this.state = {
      releases: null
    }
    this.updateReleasesInStore = this.updateReleasesInStore.bind(this);
    this.createReleaseInStore = this.createReleaseInStore.bind(this);
  }

  componentDidMount() {
    this.setState({
      releases: this.props.releases
    });
  }

  handleArtistNameChange(index, artistName) {
    let newReleases = this.props.releases;
    let release = newReleases[index];
    const newSlug = convertToUrlFriendlyString(`${artistName} ${release.title}`);
    newReleases = updatePropertyInArray(newReleases, index, artistName, 'artistName');
    newReleases = updatePropertyInArray(newReleases, index, newSlug, 'slug');
    release = newReleases[index];
    newReleases = updatePropertyInArray(newReleases, index, renderFileName(release, release.id), 'thumbnailFilename');
    this.setState({
      releases: newReleases
    });
  }

  handleTitleChange(index, title) {
    let newReleases = this.props.releases;
    let release = newReleases[index];
    const newSlug = convertToUrlFriendlyString(`${release.artistName} ${title}`);
    newReleases = updatePropertyInArray(this.props.releases, index, title, 'title');
    newReleases = updatePropertyInArray(newReleases, index, newSlug, 'slug');
    release = newReleases[index];
    newReleases = updatePropertyInArray(newReleases, index, renderFileName(release, release.id), 'thumbnailFilename');
    this.setState({
      releases: newReleases
    });
  }

  handleGenreChange(index, value) {
    this.setState({
      releases: updatePropertyInArray(this.props.releases, index, value, 'genre')
    });
  }

  handleReleaseDateChange(index, value) {
    this.setState({
      releases: updatePropertyInArray(this.props.releases, index, value.valueOf(), 'releaseDate')
    });
    this.updateReleasesInStore();
  }

  handleFetchReleaseData(index) {
    const releaseId = this.state.releases[index].id;
    fetchReleaseData(releaseId).then(releaseData => {
      let newReleaseses = this.state.releases;
      newReleaseses[index] = releaseData;
      this.setState({
        releases: newReleaseses
      }, () => {
        this.updateReleasesInStore();
      })
    });
  }

  updateReleasesInStore() {
    this.props.updateReleases(this.state.releases);
  }

  createReleaseInStore() {
    this.props.createRelease(this.state.releases);
    this.setState({
      releases: this.props.releases
    });
  }

  renderLinkList(links) {
    const linkListElements = Object.keys(links).map(linkKey => {
      const link = links[linkKey];
      return (<li key={linkKey}>
        <a href={link}>{linkKey}</a>
      </li>)
    });
    return (
      <ul>
        {linkListElements}
      </ul>
    )
  }


  renderReleasesFields(releases) {
    return releases && releases.length
      ? releases.map((release, index) => {
        return <Release release={release} index={index} key={`release-${release.id}${index}`} />
      }) : '';
  }

  render() {
    return (<div className={style.contentSection}>
      <Helmet>
        <title>Portfolio - Dashboard - Dehli Musikk</title>
      </Helmet>
      <h1>Portfolio</h1>
      {this.renderReleasesFields(this.state.releases)}
      <ActionButtonBar>
        <button onClick={this.createReleaseInStore} className={commonStyle.bgGreen}><FontAwesomeIcon icon={['fas', 'plus']} /> Add</button>
      </ActionButtonBar>
    </div>)
  }
}

const mapStateToProps = state => ({
  releases: state.releases
});

const mapDispatchToProps = {
  createRelease,
  updateReleases
};

export default connect(mapStateToProps, mapDispatchToProps)(Portfolio);
