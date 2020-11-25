// Dependencies
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Helmet } from 'react-helmet';
import DatePicker from 'react-datepicker';
import { registerLocale } from "react-datepicker";
import nb from 'date-fns/locale/nb';
import { saveAs } from 'file-saver';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// Components
import ActionButtonBar from 'components/partials/ActionButtonBar';

// Actions
import { createRelease, updateReleases } from 'actions/ReleasesActions';

// Helpers
import { updatePropertyInArray, getOrderNumberString, getGeneratedIdByDate, getGeneratedFilenameByDate } from 'helpers/objectHelpers';
import { fetchReleaseData } from 'helpers/releaseHelpers';
import {convertToUrlFriendlyString} from 'helpers/urlFormatter'

// Stylesheets
import style from 'components/routes/Dashboard.module.scss';
import commonStyle from 'components/routes/commonStyle.module.scss';
import "react-datepicker/dist/react-datepicker.css";

registerLocale('nb', nb)


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

  saveFileContent(fileContent) {
    var filename = `${fileContent.thumbnailFilename}.json`;
    var contentString = JSON.stringify(fileContent);
    var blob = new Blob([contentString], {
      type: "application/json;charset=utf-8"
    });
    saveAs(blob, filename);
  }


  handleArtistNameChange(index, artistName) {
    let newReleases = this.props.releases;
    const release = newReleases[index];
    const newSlug = convertToUrlFriendlyString(`${artistName} ${release.title}`);
    newReleases = updatePropertyInArray(newReleases, index, artistName, 'artistName');
    newReleases = updatePropertyInArray(newReleases, index, newSlug, 'slug');
    this.setState({
      releases: newReleases
    });
  }

  handleTitleChange(index, title) {
    let newReleases = this.props.releases;
    const release = newReleases[index];
    const newSlug = convertToUrlFriendlyString(`${release.artistName} ${title}`);
    newReleases = updatePropertyInArray(this.props.releases, index, title, 'title');
    newReleases = updatePropertyInArray(newReleases, index, newSlug, 'slug');
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

  renderLinkList(links){
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
        return (
          <div key={index} className={commonStyle.formListElement}>
            <span className={commonStyle.formElementGroupTitle}>Identifiers</span>
            <div className={commonStyle.formElement}>
              <label htmlFor={`id-${index}`} style={{ minWidth: '356px' }}>
                ID
                <input type="text" id={`id-${index}`} value={release.id} onChange={event => this.handleIdChange(index, event.target.value)} onBlur={this.updateReleasesInStore} />
                <button onClick={() => this.handleFetchReleaseData(index)}>Fetch data</button>
              </label>
              <label htmlFor={`slug-${index}`}>
                Slug
                <span id={`slug-${index}`}>{release.slug}</span>
              </label>
              <label htmlFor={`thumbnailFilename-${index}`}>
                Image filename
                <span id={`thumbnailFilename-${index}`}>
                  {release.thumbnailFilename}_[filesize].[filetype]
                </span>
              </label>
            </div>

            <span className={commonStyle.formElementGroupTitle}>Release info</span>
            <div className={commonStyle.formElement}>
              <label htmlFor={`artistName-${index}`}>
                Artist
                <input type="text" id={`artistName-${index}`} value={release.artistName} onChange={event => this.handleArtistNameChange(index, event.target.value)} onBlur={this.updateReleasesInStore} />
              </label>
              <label htmlFor={`title-${index}`}>
                Title
                <input type="text" id={`title-${index}`} value={release.title} onChange={event => this.handleTitleChange(index, event.target.value)} onBlur={this.updateReleasesInStore} />
              </label>
              <label htmlFor={`genre-${index}`}>
                Genre
                <input type="text" id={`genre-${index}`} value={release.genre} onChange={event => this.handleGenreChange(index, event.target.value)} onBlur={this.updateReleasesInStore} />
              </label>
            </div>
            <div className={commonStyle.formElement}>
              <label htmlFor={`releaseDate-${index}`}>
                Release date
                <DatePicker
                  id={`releaseDate-${index}`}
                  locale="nb"
                  onChange={event => this.handleReleaseDateChange(index, event)}
                  selected={release.releaseDate}
                  className={commonStyle.input} />
              </label>
              <label htmlFor={`duration-${index}`}>
                Duration
                <span id={`id-${index}`}>
                  {release.duration}
                </span>
              </label>
              <label htmlFor={`duration-${index}`}>
                Duration ISO
                <span id={`id-${index}`}>
                  {release.durationISO}
                </span>
              </label>
            </div>
            <div className={commonStyle.formElement}>
            <img loading="lazy" src={release.spotifyThumbnailUrl} width="150" height="150" className={commonStyle.thumbnail} alt='thumbnail'/>
            <label htmlFor={`spotifyThumbnailUrl-${index}`}>
                Thumbnail
                <span id={`spotifyThumbnailUrl-${index}`}>
                  {release.spotifyThumbnailUrl}
                </span>
              </label>

            </div>
            <details>
              <summary>Links {Object.keys(release.links).length}</summary>
              {this.renderLinkList(release.links)}
            </details>
            <div className={commonStyle.buttonBar}>
              <button className={commonStyle.bgBlue} onClick={() => this.saveFileContent(release)}><FontAwesomeIcon icon={['fas', 'download']} /></button>
            </div>
          </div>
        )
      }) : '';
  }

  render() {
    return (<div className={style.contentSection}>
      <Helmet>
        <title>Portfolio - Dashboard - Dehli Musikk</title>
      </Helmet>
      <h1>Portfolio</h1>
      {this.props.releases ? this.renderReleasesFields(this.props.releases) : ''}
      
      <ActionButtonBar>
        <button onClick={this.createReleaseInStore} className={commonStyle.bgGreen}><FontAwesomeIcon icon={['fas', 'plus']} /> Add</button>
      </ActionButtonBar>
    </div>)
  }
}

const mapStateToProps = state => ({ releases: state.releases });

const mapDispatchToProps = {
  createRelease,
  updateReleases
};

export default connect(mapStateToProps, mapDispatchToProps)(Portfolio);
