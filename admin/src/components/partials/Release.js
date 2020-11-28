// Dependencies
import React, { Component } from 'react';
import { connect } from 'react-redux';
import DatePicker from 'react-datepicker';
import { saveAs } from 'file-saver';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// Actions
import { createRelease, updateReleases } from 'actions/ReleasesActions';

// Helpers
import { fetchReleaseData, renderFileName } from 'helpers/releaseHelpers';
import { getReleaseInstruments, getNotSelectedReleaseInstruments } from 'helpers/releaseInstrumentHelpers';
import { convertToUrlFriendlyString } from 'helpers/urlFormatter'

// Stylesheets
import commonStyle from 'components/partials/commonStyle.module.scss';




class Release extends Component {
  constructor(props) {
    super(props);
    this.state = {
      release: null,
      addLinkIsActive: false,
      addInstrumentIsActive: false
    }
    this.updateReleasesInStore = this.updateReleasesInStore.bind(this);
  }

  componentDidMount() {
    this.setState({
      release: this.props.release
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

  handleIdChange(id) {
    this.setState({
      release: {
        ...this.state.release,
        id
      }
    });
  }


  handleArtistNameChange(artistName) {
    const slug = convertToUrlFriendlyString(`${artistName} ${this.state.release.title}`);
    const thumbnailFilename = renderFileName(artistName, this.state.release.title, this.state.release.id);
    this.setState({
      release: {
        ...this.state.release,
        artistName,
        slug,
        thumbnailFilename
      }
    });
  }

  handleTitleChange(title) {
    const slug = convertToUrlFriendlyString(`${this.state.release.artistName} ${title}`);
    const thumbnailFilename = renderFileName(this.state.release.artistName, title, this.state.release.id);
    this.setState({
      release: {
        ...this.state.release,
        title,
        slug,
        thumbnailFilename
      }
    });
  }

  handleGenreChange(genre) {
    this.setState({
      release: {
        ...this.state.release,
        genre
      }
    });
  }

  handleReleaseDateChange(releaseDate) {
    this.setState({
      release: {
        ...this.state.release,
        releaseDate
      }
    });
    this.updateReleasesInStore();
  }

  handleFetchReleaseData() {
    fetchReleaseData(this.state.release.id).then(release => {
      this.setState({
        release
      }, () => {
        this.updateReleasesInStore();
      })
    });
  }

  updateReleasesInStore() {
    let newReleases = this.props.releases;
    newReleases[this.props.index] = this.state.release;
    this.props.updateReleases(newReleases);
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

  renderAvailableInstrumetsOptions(instruments, selectedInstruments) {
    const notSelectedInstruments = getNotSelectedReleaseInstruments(instruments, selectedInstruments);
    return notSelectedInstruments.map(notSelectedInstrument => {
      const equipmentId = convertToUrlFriendlyString(`${notSelectedInstrument.brand} ${notSelectedInstrument.model}`);
      return <option value={equipmentId} key={equipmentId}>{notSelectedInstrument.brand} {notSelectedInstrument.model}</option>
    })
  }

  renderInstrumentList(selectedInstruments) {
    const instrumentListElements = selectedInstruments.map(instrument => {
      return (<li key={instrument.equipmentItemId}>
        <a href={`#${instrument.equipmentItemId}`}>{instrument.brand} {instrument.model}</a>
        <button><FontAwesomeIcon icon={['fas', 'trash']} /></button>
      </li>)
    });
    return (
      <React.Fragment>
        <ul className={commonStyle.formList}>
          {instrumentListElements}
          {
            this.state.addInstrumentIsActive
              ? (
                <li>
                  <div className={commonStyle.formElement}>
                    <label>
                      <select>
                        {this.renderAvailableInstrumetsOptions(this.props.instruments, selectedInstruments)}
                      </select>
                      <div className={commonStyle.inputAddons}>
                        <button onClick={() => this.setState({ addInstrumentIsActive: false })}>
                          Cancel
                    </button>
                        <button onClick={() => this.setState({ addInstrumentIsActive: true })}>
                          Confirm
                    </button>
                      </div>
                    </label>

                  </div>
                </li>
              )
              : (
                <li>
                  <button onClick={() => this.setState({ addInstrumentIsActive: true })} className={commonStyle.fullWidthButton}>
                    <FontAwesomeIcon icon={['fas', 'plus']} /> Add instrument
                  </button>
                </li>
              )
          }
        </ul>
      </React.Fragment>
    )
  }

  render() {
    const release = this.state.release;
    const index = this.props.index;
    if (release) {
      const releaseInstruments = getReleaseInstruments(this.props.releasesInstruments, release.slug, this.props.instruments);
      return (
        <div key={index} className={commonStyle.formListElement}>
          <span className={commonStyle.formElementGroupTitle}>Identifiers</span>
          <div className={commonStyle.formElement}>
            <label htmlFor={`id-${index}`} style={{ minWidth: '356px' }}>
              ID
            <input type="text" id={`id-${index}`} value={release.id} onChange={event => this.handleIdChange(event.target.value)} onBlur={this.updateReleasesInStore} />
              <div className={commonStyle.inputAddons}>
                <button onClick={() => this.handleFetchReleaseData()}>Fetch data</button>
              </div>
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
                <input type="text" id={`artistName-${index}`} value={release.artistName} onChange={event => this.handleArtistNameChange(event.target.value)} onBlur={this.updateReleasesInStore} />
            </label>
            <label htmlFor={`title-${index}`}>
              Title
                <input type="text" id={`title-${index}`} value={release.title} onChange={event => this.handleTitleChange(event.target.value)} onBlur={this.updateReleasesInStore} />
            </label>
            <label htmlFor={`genre-${index}`}>
              Genre
                <input type="text" id={`genre-${index}`} value={release.genre} onChange={event => this.handleGenreChange(event.target.value)} onBlur={this.updateReleasesInStore} />
            </label>
          </div>
          <div className={commonStyle.formElement}>
            <label htmlFor={`releaseDate-${index}`}>
              Release date
                <DatePicker
                id={`releaseDate-${index}`}
                locale="nb"
                onChange={value => this.handleReleaseDateChange(value.valueOf())}
                selected={release.releaseDate}
                className={commonStyle.input} />
            </label>
            <label htmlFor={`duration-${index}`}>
              Duration
                <span id={`duration-${index}`}>
                {release.duration}
              </span>
            </label>
            <label htmlFor={`duration-iso-${index}`}>
              Duration ISO
                <span id={`duration-iso-${index}`}>
                {release.durationISO}
              </span>
            </label>
          </div>
          <div className={commonStyle.formElement}>
            <img loading="lazy" src={release.spotifyThumbnailUrl} width="150" height="150" className={commonStyle.thumbnail} alt='thumbnail' />
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
          <details>
            <summary>Instruments {releaseInstruments.length}</summary>
            {this.renderInstrumentList(releaseInstruments)}
          </details>
          <div className={commonStyle.buttonBar}>
            <button className={commonStyle.bgBlue} onClick={() => this.saveFileContent(release)}><FontAwesomeIcon icon={['fas', 'download']} /></button>
          </div>
        </div>
      )
    } else {
      return '';
    }
  }
}

const mapStateToProps = state => ({
  instruments: state.instruments,
  releases: state.releases,
  releasesInstruments: state.releasesInstruments
});

const mapDispatchToProps = {
  createRelease,
  updateReleases
};

export default connect(mapStateToProps, mapDispatchToProps)(Release);
