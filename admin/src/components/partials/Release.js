// Dependencies
import React, { Component } from 'react';
import { connect } from 'react-redux';
import DatePicker from 'react-datepicker';
import { saveAs } from 'file-saver';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// Actions
import { createRelease, updateReleases } from 'actions/ReleasesActions';

// Helpers
import { fetchReleaseData, renderFileName, convertMillisToIsoDuration } from 'helpers/releaseHelpers';
import { getReleaseInstruments, getNotSelectedReleaseInstruments } from 'helpers/releaseInstrumentHelpers';
import { convertToUrlFriendlyString } from 'helpers/urlFormatter'

// Stylesheets
import commonStyle from 'components/partials/commonStyle.module.scss';




class Release extends Component {
  constructor(props) {
    super(props);
    this.state = {
      release: null,
      updatedRelease: null,
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
    const thumbnailFilename = renderFileName(artistName, this.state.release.title);
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
    const thumbnailFilename = renderFileName(this.state.release.artistName, title);
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

  handleDurationChange(duration) {
    duration = parseInt(duration);
    const durationISO = convertMillisToIsoDuration(duration);
    this.setState({
      release: {
        ...this.state.release,
        duration,
        durationISO
      }
    });
    this.updateReleasesInStore();
  }

  handleIsrcCodeChange(isrcCode) {
    this.setState({
      release: {
        ...this.state.release,
        isrcCode
      }
    });
  }

  handleComposedByDehliMusikkChange(checked) {
    this.setState({
      release: {
        ...this.state.release,
        composedByDehliMusikk: checked
      }
    });
  }

  handleProducedByDehliMusikkChange(checked) {
    this.setState({
      release: {
        ...this.state.release,
        producedByDehliMusikk: checked
      }
    });
  }

  handleUnreleasedChange(checked) {
    this.setState({
      release: {
        ...this.state.release,
        unreleased: checked
      }
    });
  }


  handleLinkChange(linkKey, link) {
    this.setState({
      release: {
        ...this.state.release,
        links: {
          ...this.state.release.links,
          [linkKey]: link
        }
      }
    });
    this.updateReleasesInStore();
  }

  handleLinkRemove(linkKey) {
    let newLinks = this.state.release.links;
    delete newLinks[linkKey];
    this.setState({
      release: {
        ...this.state.release,
        links: newLinks
      }
    });
    this.updateReleasesInStore();
  }

  handleLinksReplace(links) {
    this.setState({
      release: {
        ...this.state.release,
        links
      }
    });
    this.updateReleasesInStore();
  }

  handleFetchReleaseData() {
    fetchReleaseData(this.state.release.id).then(release => {
      const isPreviouslyFetched = this.state.release?.slug?.length ? true : false;
      if (isPreviouslyFetched) {
        this.setState({
          updatedRelease: release
        })
      } else {
        this.setState({
          release
        }, () => {
          this.updateReleasesInStore();
        })
      }
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
      const linkHasChanged = this.state.updatedRelease?.links?.[linkKey] && this.state.updatedRelease.links[linkKey] !== link;
      const linkIsRemoved = this.state.updatedRelease?.links && !this.state.updatedRelease?.links?.[linkKey];
      return (<li key={linkKey}>
        <a href={link}>{linkKey}</a>
        {linkIsRemoved ? <button onClick={() => { this.handleLinkRemove(linkKey) }}>Remove link</button> : ''}
        {linkHasChanged ? (
          <div>
            <dl>
              <dt>Saved link: </dt>
              <dd>
                <a href={link} target="_blank" rel="noreferrer">{link}</a>
              </dd>
              <dt>Updated link:</dt>
              <dd>
                <a href={this.state.updatedRelease.links[linkKey]} target="_blank" rel="noreferrer">{this.state.updatedRelease.links[linkKey]}</a>
              </dd>
            </dl>
            <button onClick={() => { this.handleLinkChange(linkKey, this.state.updatedRelease.links[linkKey]) }}>Replace link</button>
          </div>
        )
          : ''}
      </li>)
    });
    return (
      <ul>
        {linkListElements}
      </ul>
    )
  }

  renderUpdatedLinkList(links) {
    const linkListElements = Object.keys(links).map(linkKey => {
      const link = links[linkKey];
      const linkHasChanged = this.state.release?.links?.[linkKey] && this.state.release.links[linkKey] !== link;
      const linkIsNew = !this.state.release.links[linkKey];
      return (<li key={linkKey}>
        <a href={link}>{linkKey}</a>
        {linkIsNew ? <button onClick={() => { this.handleLinkChange(linkKey, link) }}>Add link</button> : ''}
        {linkHasChanged ? (
          <div>
            <dl>
              <dt>Saved link: </dt>
              <dd>
                <a href={this.state.release.links[linkKey]} target="_blank" rel="noreferrer">{this.state.release.links[linkKey]}</a>
              </dd>
              <dt>Updated link:</dt>
              <dd>
                <a href={link} target="_blank" rel="noreferrer">{link}</a>
              </dd>
            </dl>
            <button onClick={() => { this.handleLinkChange(linkKey, link) }}>Replace link</button>
          </div>
        )
          : ''}
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
    const updatedRelease = this.state.updatedRelease;
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
              {
                updatedRelease?.artistName && updatedRelease.artistName !== this.state.release.artistName
                  ? (<span>{updatedRelease.artistName} <button onClick={() => this.handleArtistNameChange(updatedRelease.artistName)}>Replace</button></span>)
                  : ''
              }
            </label>
            <label htmlFor={`title-${index}`}>
              Title
              <input type="text" id={`title-${index}`} value={release.title} onChange={event => this.handleTitleChange(event.target.value)} onBlur={this.updateReleasesInStore} />
              {
                updatedRelease?.title && updatedRelease.title !== this.state.release.title
                  ? (<span>{updatedRelease.title} <button onClick={() => this.handleTitleChange(updatedRelease.title)}>Replace</button></span>)
                  : ''
              }
            </label>
            <label htmlFor={`genre-${index}`}>
              Genre
              <input type="text" id={`genre-${index}`} value={release.genre} onChange={event => this.handleGenreChange(event.target.value)} onBlur={this.updateReleasesInStore} />
              {
                updatedRelease?.genre && updatedRelease.genre !== this.state.release.genre
                  ? (<span>{updatedRelease.genre} <button onClick={() => this.handleGenreChange(updatedRelease.genre)}>Replace</button></span>)
                  : ''
              }
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
              {
                updatedRelease?.releaseDate && updatedRelease.releaseDate !== this.state.release.releaseDate
                  ? (
                    <div>
                      <DatePicker
                        id={`updatedReleaseDate-${index}`}
                        locale="nb"
                        selected={updatedRelease.releaseDate}
                        readOnly
                        className={commonStyle.input} />
                      <button onClick={() => this.handleReleaseDateChange(updatedRelease.releaseDate)}>Replace</button>
                    </div>
                  )
                  : ''
              }
            </label>
            <label htmlFor={`duration-${index}`}>
              Duration
              <input type="number" id={`duration-${index}`} value={release.duration} onChange={event => this.handleDurationChange(event.target.value)} onBlur={this.updateReleasesInStore} />
              {
                updatedRelease?.duration && updatedRelease.duration !== this.state.release.duration
                  ? (<span>{updatedRelease.duration} <button onClick={() => this.handleDurationChange(updatedRelease.duration)}>Replace</button></span>)
                  : ''
              }
            </label>

            <label htmlFor={`duration-iso-${index}`}>
              Duration ISO
              <span id={`duration-iso-${index}`}>
                {release.durationISO}
              </span>
            </label>
          </div>

          <div className={commonStyle.formElement}>
            <label htmlFor={`isrcCode-${index}`}>
              ISRC Code
              <input type="text" id={`isrcCode-${index}`} value={release.isrcCode} onChange={event => this.handleIsrcCodeChange(event.target.value)} onBlur={this.updateReleasesInStore} />
              {
                updatedRelease?.isrcCode && updatedRelease.isrcCode !== this.state.release.isrcCode
                  ? (<span>{updatedRelease.isrcCode} <button onClick={() => this.handleIsrcCodeChange(updatedRelease.isrcCode)}>Replace</button></span>)
                  : ''
              }
            </label>
            <label htmlFor={`composedByDehliMusikk-${index}`}>
              Composed by Dehli Musikk
              <input type="checkbox" id={`composedByDehliMusikk-${index}`} checked={release.composedByDehliMusikk ? true : false} onChange={event => this.handleComposedByDehliMusikkChange(event.target.checked)} onBlur={this.updateReleasesInStore} />
            </label>
            <label htmlFor={`producedByDehliMusikk-${index}`}>
              Produced by Dehli Musikk
              <input type="checkbox" id={`producedByDehliMusikk-${index}`} checked={release.producedByDehliMusikk ? true : false} onChange={event => this.handleProducedByDehliMusikkChange(event.target.checked)} onBlur={this.updateReleasesInStore} />
            </label>
          </div>

          <div className={commonStyle.formElement}>
            <label htmlFor={`unreleased-${index}`}>
              Unreleased
              <input type="checkbox" id={`unreleased-${index}`} checked={release.unreleased ? true : false} onChange={event => this.handleUnreleasedChange(event.target.checked)} onBlur={this.updateReleasesInStore} />
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
          {
            updatedRelease?.links
              ? (<details>
                <summary>Updated links {Object.keys(updatedRelease.links).length}</summary>
                {this.renderUpdatedLinkList(updatedRelease.links)}
                <button onClick={() => this.handleLinksReplace(updatedRelease.links)}>Replace</button>
              </details>)
              : ''
          }
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
