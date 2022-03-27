// Dependencies
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import DatePicker from 'react-datepicker';
import { saveAs } from 'file-saver';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// Actions
import { updateReleases } from 'actions/ReleasesActions';

// Helpers
import { fetchReleaseData, renderFileName, convertMillisToIsoDuration } from 'helpers/releaseHelpers';
import { getReleaseInstruments, getNotSelectedReleaseInstruments } from 'helpers/releaseInstrumentHelpers';
import { convertToUrlFriendlyString } from 'helpers/urlFormatter'

// Stylesheets
import commonStyle from 'components/partials/commonStyle.module.scss';


const Release = ({ releaseData, index }) => {

  // Redux store
  const instruments = useSelector(state => state.instruments)
  const releases = useSelector(state => state.releases)
  const releasesInstruments = useSelector(state => state.releasesInstruments)

  // State
  const [release, setRelease] = useState();
  const [updatedRelease, setUpdatedRelease] = useState();
  const [addInstrumentIsActive, setAddInstrumentIsActive] = useState();


  useEffect(() => {
    setRelease(releaseData);
  }, [releaseData]);




  const saveFileContent = (fileContent) => {
    var filename = `${fileContent.thumbnailFilename}.json`;
    var contentString = JSON.stringify(fileContent);
    var blob = new Blob([contentString], {
      type: "application/json;charset=utf-8"
    });
    saveAs(blob, filename);
  }

  const handleIdChange = (id) => {
    setRelease({
      ...release,
      id
    });
  }


  const handleArtistNameChange = (artistName) => {
    const slug = convertToUrlFriendlyString(`${artistName} ${release.title}`);
    const thumbnailFilename = renderFileName(artistName, release.title);
    setRelease({
      ...release,
      artistName,
      slug,
      thumbnailFilename
    });
  }

  const handleTitleChange = (title) => {
    const slug = convertToUrlFriendlyString(`${release.artistName} ${title}`);
    const thumbnailFilename = renderFileName(release.artistName, title);
    setRelease({
      ...release,
      title,
      slug,
      thumbnailFilename
    });
  }

  const handleGenreChange = (genre) => {
    setRelease({
      ...release,
      genre
    });
  }

  const handleReleaseDateChange = (releaseDate) => {
    setRelease({
      ...release,
      releaseDate
    });
    updateReleasesInStore();
  }

  const handleDurationChange = (duration) => {
    duration = parseInt(duration);
    const durationISO = convertMillisToIsoDuration(duration);
    setRelease({
      ...release,
      duration,
      durationISO
    });
    updateReleasesInStore();
  }

  const handleIsrcCodeChange = (isrcCode) => {
    setRelease({
      ...release,
      isrcCode
    });
  }

  const handleComposedByDehliMusikkChange = (checked) => {
    setRelease({
      ...release,
      composedByDehliMusikk: checked
    });
  }

  const handleProducedByDehliMusikkChange = (checked) => {
    setRelease({
      ...release,
      producedByDehliMusikk: checked
    });
  }

  const handleUnreleasedChange = (checked) => {
    setRelease({
      ...release,
      unreleased: checked
    });
  }

  const handleSpotifyThumbnailUrlChange = (spotifyThumbnailUrl) => {
    setRelease({
      ...release,
      spotifyThumbnailUrl
    });
  }


  const handleLinkChange = (linkKey, link) => {
    setRelease({
      ...release,
      links: {
        ...release.links,
        [linkKey]: link
      }
    })
    updateReleasesInStore();
  }

  const handleLinkRemove = (linkKey) => {
    let newLinks = release.links;
    delete newLinks[linkKey];
    setRelease({
      ...release,
      links: newLinks
    });
    updateReleasesInStore();
  }

  const handleLinksReplace = (links) => {
    setRelease({
      ...release,
      links
    });
    updateReleasesInStore();
  }

  const handleFetchReleaseData = () => {
    fetchReleaseData(release.id).then(release => {
      const isPreviouslyFetched = release?.slug?.length ? true : false;
      if (isPreviouslyFetched) {
        setUpdatedRelease(release);
      } else {
        setRelease(release);
        updateReleasesInStore();
      }
    });
  }

  const updateReleasesInStore = () => {
    let newReleases = releases;
    newReleases[index] = release;
    updateReleases(newReleases);
  }

  const renderLinkList = (links) => {
    const linkListElements = Object.keys(links).map(linkKey => {
      const link = links[linkKey];
      const linkHasChanged = updatedRelease?.links?.[linkKey] && updatedRelease.links[linkKey] !== link;
      const linkIsRemoved = updatedRelease?.links && !updatedRelease?.links?.[linkKey];
      return (<li key={linkKey}>
        <a href={link}>{linkKey}</a>
        {linkIsRemoved ? <button onClick={() => { handleLinkRemove(linkKey) }}>Remove link</button> : ''}
        {linkHasChanged ? (
          <div>
            <dl>
              <dt>Saved link: </dt>
              <dd>
                <a href={link} target="_blank" rel="noreferrer">{link}</a>
              </dd>
              <dt>Updated link:</dt>
              <dd>
                <a href={updatedRelease.links[linkKey]} target="_blank" rel="noreferrer">{updatedRelease.links[linkKey]}</a>
              </dd>
            </dl>
            <button onClick={() => { this.handleLinkChange(linkKey, updatedRelease.links[linkKey]) }}>Replace link</button>
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

  const renderUpdatedLinkList = (links) => {
    const linkListElements = Object.keys(links).map(linkKey => {
      const link = links[linkKey];
      const linkHasChanged = release?.links?.[linkKey] && release.links[linkKey] !== link;
      const linkIsNew = !release.links[linkKey];
      return (<li key={linkKey}>
        <a href={link}>{linkKey}</a>
        {linkIsNew ? <button onClick={() => { handleLinkChange(linkKey, link) }}>Add link</button> : ''}
        {linkHasChanged ? (
          <div>
            <dl>
              <dt>Saved link: </dt>
              <dd>
                <a href={release.links[linkKey]} target="_blank" rel="noreferrer">{release.links[linkKey]}</a>
              </dd>
              <dt>Updated link:</dt>
              <dd>
                <a href={link} target="_blank" rel="noreferrer">{link}</a>
              </dd>
            </dl>
            <button onClick={() => { handleLinkChange(linkKey, link) }}>Replace link</button>
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

  const renderAvailableInstrumetsOptions = (instruments, selectedInstruments) => {
    const notSelectedInstruments = getNotSelectedReleaseInstruments(instruments, selectedInstruments);
    return notSelectedInstruments.map(notSelectedInstrument => {
      const equipmentId = convertToUrlFriendlyString(`${notSelectedInstrument.brand} ${notSelectedInstrument.model}`);
      return <option value={equipmentId} key={equipmentId}>{notSelectedInstrument.brand} {notSelectedInstrument.model}</option>
    });
  }

  const renderInstrumentList = (selectedInstruments) => {
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
            addInstrumentIsActive
              ? (
                <li>
                  <div className={commonStyle.formElement}>
                    <label>
                      <select>
                        {renderAvailableInstrumetsOptions(instruments, selectedInstruments)}
                      </select>
                      <div className={commonStyle.inputAddons}>
                        <button onClick={() => setAddInstrumentIsActive(false)}>
                          Cancel
                        </button>
                        <button onClick={() => setAddInstrumentIsActive(true)}>
                          Confirm
                        </button>
                      </div>
                    </label>

                  </div>
                </li>
              )
              : (
                <li>
                  <button onClick={() => setAddInstrumentIsActive(true)} className={commonStyle.fullWidthButton}>
                    <FontAwesomeIcon icon={['fas', 'plus']} /> Add instrument
                  </button>
                </li>
              )
          }
        </ul>
      </React.Fragment>
    )
  }


  if (release) {
    const releaseInstruments = getReleaseInstruments(releasesInstruments, release.slug, instruments);
    return (
      <div key={index} className={commonStyle.formListElement}>
        <span className={commonStyle.formElementGroupTitle}>Identifiers</span>
        <div className={commonStyle.formElement}>
          <label htmlFor={`id-${index}`} style={{ minWidth: '356px' }}>
            ID
            <input type="text" id={`id-${index}`} value={release.id} onChange={event => handleIdChange(event.target.value)} onBlur={updateReleasesInStore} />
            <div className={commonStyle.inputAddons}>
              <button onClick={handleFetchReleaseData}>Fetch data</button>
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
            <input type="text" id={`artistName-${index}`} value={release.artistName} onChange={event => handleArtistNameChange(event.target.value)} onBlur={updateReleasesInStore} />
            {
              updatedRelease?.artistName && updatedRelease.artistName !== release.artistName
                ? (<span>{updatedRelease.artistName} <button onClick={() => handleArtistNameChange(updatedRelease.artistName)}>Replace</button></span>)
                : ''
            }
          </label>
          <label htmlFor={`title-${index}`}>
            Title
            <input type="text" id={`title-${index}`} value={release.title} onChange={event => handleTitleChange(event.target.value)} onBlur={updateReleasesInStore} />
            {
              updatedRelease?.title && updatedRelease.title !== release.title
                ? (<span>{updatedRelease.title} <button onClick={() => handleTitleChange(updatedRelease.title)}>Replace</button></span>)
                : ''
            }
          </label>
          <label htmlFor={`genre-${index}`}>
            Genre
            <input type="text" id={`genre-${index}`} value={release.genre} onChange={event => handleGenreChange(event.target.value)} onBlur={updateReleasesInStore} />
            {
              updatedRelease?.genre && updatedRelease.genre !== release.genre
                ? (<span>{updatedRelease.genre} <button onClick={() => handleGenreChange(updatedRelease.genre)}>Replace</button></span>)
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
              onChange={value => handleReleaseDateChange(value.valueOf())}
              selected={release.releaseDate}
              className={commonStyle.input} />
            {
              updatedRelease?.releaseDate && updatedRelease.releaseDate !== release.releaseDate
                ? (
                  <div>
                    <DatePicker
                      id={`updatedReleaseDate-${index}`}
                      locale="nb"
                      selected={updatedRelease.releaseDate}
                      readOnly
                      className={commonStyle.input} />
                    <button onClick={() => handleReleaseDateChange(updatedRelease.releaseDate)}>Replace</button>
                  </div>
                )
                : ''
            }
          </label>
          <label htmlFor={`duration-${index}`}>
            Duration
            <input type="number" id={`duration-${index}`} value={release.duration} onChange={event => handleDurationChange(event.target.value)} onBlur={updateReleasesInStore} />
            {
              updatedRelease?.duration && updatedRelease.duration !== release.duration
                ? (<span>{updatedRelease.duration} <button onClick={() => handleDurationChange(updatedRelease.duration)}>Replace</button></span>)
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
            <input type="text" id={`isrcCode-${index}`} value={release.isrcCode} onChange={event => handleIsrcCodeChange(event.target.value)} onBlur={updateReleasesInStore} />
            {
              updatedRelease?.isrcCode && updatedRelease.isrcCode !== release.isrcCode
                ? (<span>{updatedRelease.isrcCode} <button onClick={() => handleIsrcCodeChange(updatedRelease.isrcCode)}>Replace</button></span>)
                : ''
            }
          </label>
          <label htmlFor={`composedByDehliMusikk-${index}`}>
            Composed by Dehli Musikk
            <input type="checkbox" id={`composedByDehliMusikk-${index}`} checked={release.composedByDehliMusikk ? true : false} onChange={event => handleComposedByDehliMusikkChange(event.target.checked)} onBlur={updateReleasesInStore} />
          </label>
          <label htmlFor={`producedByDehliMusikk-${index}`}>
            Produced by Dehli Musikk
            <input type="checkbox" id={`producedByDehliMusikk-${index}`} checked={release.producedByDehliMusikk ? true : false} onChange={event => handleProducedByDehliMusikkChange(event.target.checked)} onBlur={updateReleasesInStore} />
          </label>
        </div>

        <div className={commonStyle.formElement}>
          <label htmlFor={`unreleased-${index}`}>
            Unreleased
            <input type="checkbox" id={`unreleased-${index}`} checked={release.unreleased ? true : false} onChange={event => handleUnreleasedChange(event.target.checked)} onBlur={updateReleasesInStore} />
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
          {
            updatedRelease?.spotifyThumbnailUrl && updatedRelease.spotifyThumbnailUrl !== release.spotifyThumbnailUrl
              ? (
                <React.Fragment>
                  <img loading="lazy" src={updatedRelease.spotifyThumbnailUrl} width="150" height="150" className={commonStyle.thumbnail} alt='thumbnail' />
                  <label>
                    New thumbnail
                    <span>
                      {updatedRelease.spotifyThumbnailUrl} <button onClick={() => handleSpotifyThumbnailUrlChange(updatedRelease.spotifyThumbnailUrl)}>Replace</button>
                    </span>
                  </label>
                </React.Fragment>)
              : ''
          }
        </div>
        <details>
          <summary>Links {Object.keys(release.links).length}</summary>
          {renderLinkList(release.links)}
        </details>
        {
          updatedRelease?.links
            ? (<details>
              <summary>Updated links {Object.keys(updatedRelease.links).length}</summary>
              {renderUpdatedLinkList(updatedRelease.links)}
              <button onClick={() => handleLinksReplace(updatedRelease.links)}>Replace</button>
            </details>)
            : ''
        }
        <details>
          <summary>Instruments {releaseInstruments.length}</summary>
          {renderInstrumentList(releaseInstruments)}
        </details>
        <div className={commonStyle.buttonBar}>
          <button className={commonStyle.bgBlue} onClick={() => saveFileContent(release)}><FontAwesomeIcon icon={['fas', 'download']} /></button>
        </div>
      </div>
    )
  } else {
    return '';
  }
}

export default Release;
