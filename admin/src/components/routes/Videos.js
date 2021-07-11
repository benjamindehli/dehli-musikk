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
import { createVideo, updateVideos } from 'actions/VideosActions';

// Helpers
import { updatePropertyInArray, updateMultilingualPropertyInArray, getOrderNumberString, getGeneratedIdByDate, getGeneratedFilenameByDate } from 'helpers/objectHelpers';

// Stylesheets
import style from 'components/routes/Dashboard.module.scss';
import commonStyle from 'components/partials/commonStyle.module.scss';
import "react-datepicker/dist/react-datepicker.css";

registerLocale('nb', nb)


class Videos extends Component {
  constructor(props) {
    super(props);
    this.state = {
      videos: null
    }
    this.createVideoInStore = this.createVideoInStore.bind(this);
    this.updateVideosInStore = this.updateVideosInStore.bind(this);
  }

  componentDidMount() {
    this.setState({
      videos: this.props.videos
    });
  }

  saveFileContent(fileContent, latest = true) {
    const filename = latest ? "latest.json" : 'all.json';
    fileContent.sort((a, b) => parseFloat(b.timestamp) - parseFloat(a.timestamp));

    if (latest) {
      fileContent = fileContent.slice(0, 3);
    }
    const contentString = JSON.stringify(fileContent);
    const blob = new Blob([contentString], {
      type: "application/json;charset=utf-8"
    });
    saveAs(blob, filename);
  }


  handleOrderNumberChange(index, orderNumber) {
    const video = this.props.videos[index];
    const date = new Date(video.timestamp);
    const orderNumberString = getOrderNumberString(orderNumber);
    const thumbnailFilename = getGeneratedFilenameByDate(date, orderNumberString);
    const id = getGeneratedIdByDate(date, orderNumberString);
    this.setState({
      videos: updatePropertyInArray(this.props.videos, index, parseInt(orderNumber), 'orderNumber')
    });
    this.setState({
      videos: updatePropertyInArray(this.props.videos, index, thumbnailFilename, 'thumbnailFilename')
    });
    this.setState({
      videos: updatePropertyInArray(this.props.videos, index, id, 'id')
    });
  }

  handleTimestampChange(index, value) {
    const video = this.props.videos[index];
    const orderNumberString = getOrderNumberString(video.orderNumber);
    const thumbnailFilename = getGeneratedFilenameByDate(value, orderNumberString);
    const id = getGeneratedIdByDate(value, orderNumberString);
    this.setState({
      videos: updatePropertyInArray(this.props.videos, index, value.valueOf(), 'timestamp')
    });
    this.setState({
      videos: updatePropertyInArray(this.props.videos, index, thumbnailFilename, 'thumbnailFilename')
    });
    this.setState({
      videos: updatePropertyInArray(this.props.videos, index, id, 'id')
    });
    this.updateVideosInStore();
  }

  handleTitleChange(index, value, language) {
    this.setState({
      videos: updateMultilingualPropertyInArray(this.props.videos, index, value, 'title', language)
    });
  }

  handleContentChange(index, value, language) {
    this.setState({
      videos: updateMultilingualPropertyInArray(this.props.videos, index, value, 'content', language)
    });
  }

  handleThumbnailFilenameChange(index, value) {
    this.setState({
      videos: updatePropertyInArray(this.props.videos, index, value, 'thumbnailFilename')
    });
  }

  handleThumbnailDescriptionChange(index, value) {
    this.setState({
      videos: updatePropertyInArray(this.props.videos, index, value, 'thumbnailDescription')
    });
  }

  handleCopyrightChange(index, value) {
    this.setState({
      videos: updatePropertyInArray(this.props.videos, index, value, 'copyright')
    });
  }

  handleYouTubeChannelIdChange(index, value) {
    this.setState({
      videos: updatePropertyInArray(this.props.videos, index, value, 'youTubeChannelId')
    });
  }

  handleYouTubeUserChange(index, value) {
    this.setState({
      videos: updatePropertyInArray(this.props.videos, index, value, 'youTubeUser')
    });
  }

  handleYouTubeIdChange(index, value) {
    this.setState({
      videos: updatePropertyInArray(this.props.videos, index, value, 'youTubeId')
    });
  }

  handleClipsChange(index, value) {
    this.setState({
      videos: updatePropertyInArray(this.props.videos, index, value, 'clips')
    });
  }


  createVideoInStore() {
    this.props.createVideo(this.state.videos);
    this.setState({
      videos: this.props.videos
    });
  }

  updateVideosInStore() {
    this.props.updateVideos(this.state.videos);
  }

  getHoursFromDuration(duration) {
    const regex = /(\d+)(H)/i;
    const matches = regex.exec(duration);
    return matches && matches[1] ? matches[1] : '';
  }

  getMinutesFromDuration(duration) {
    const regex = /(\d+)(M)/i;
    const matches = regex.exec(duration);
    return matches && matches[1] ? matches[1] : '';
  }

  getSecondsFromDuration(duration) {
    const regex = /(\d+)(S)/i;
    const matches = regex.exec(duration);
    return matches && matches[1] ? matches[1] : '';
  }

  convertToYoutubeDuration(hours, minutes, seconds) {
    hours = hours && hours !== '0' ? `${hours}H` : '';
    minutes = minutes && minutes !== '0' ? `${minutes}M` : '';
    seconds = seconds && seconds !== '0' ? `${seconds}S` : '';
    return `PT${hours}${minutes}${seconds}`;
  }

  handleDurationHoursChange(index, hours) {
    const minutes = this.getMinutesFromDuration(this.state.videos[index].duration);
    const seconds = this.getSecondsFromDuration(this.state.videos[index].duration);
    const duration = this.convertToYoutubeDuration(hours, minutes, seconds);

    this.setState({
      videos: updatePropertyInArray(this.props.videos, index, duration, 'duration')
    });
  }

  handleDurationMinutesChange(index, minutes) {
    const hours = this.getHoursFromDuration(this.state.videos[index].duration);
    const seconds = this.getSecondsFromDuration(this.state.videos[index].duration);
    const duration = this.convertToYoutubeDuration(hours, minutes, seconds);

    this.setState({
      videos: updatePropertyInArray(this.props.videos, index, duration, 'duration')
    });
  }

  handleDurationSecondsChange(index, seconds) {
    const hours = this.getHoursFromDuration(this.state.videos[index].duration);
    const minutes = this.getMinutesFromDuration(this.state.videos[index].duration);
    const duration = this.convertToYoutubeDuration(hours, minutes, seconds);

    this.setState({
      videos: updatePropertyInArray(this.props.videos, index, duration, 'duration')
    });
  }

  getHoursFromClipOffsetValue(clipOffsetValue) {
    return Math.floor(clipOffsetValue / 3600);
  }
  getMinutesFromClipOffsetValue(clipOffsetValue) {
    return Math.floor(clipOffsetValue % 3600 / 60);
  }
  getSecondsFromClipOffsetValue(clipOffsetValue) {
    return Math.floor(clipOffsetValue % 60);
  }

  getOffsetValueFromDuration(duration) {
    const hours = this.getHoursFromDuration(duration);
    const minutes = this.getMinutesFromDuration(duration);
    const seconds = this.getSecondsFromDuration(duration);
    return (hours * 3600) + (minutes * 60) + (seconds * 1);
  }

  handleClipNameChange(videoIndex, clipIndex, name, language) {
    const clips = this.state.videos[videoIndex].clips;
    clips[clipIndex].name[language] = name;
    this.setState({
      videos: updatePropertyInArray(this.props.videos, videoIndex, clips, 'clips')
    });
  }

  handleClipOffsetHoursChange(videoIndex, clipIndex, hours) {
    hours = hours ? parseInt(hours) : 0;
    const clips = this.state.videos[videoIndex].clips;
    const prevStartOffset = clips[clipIndex].startOffset;
    const prevStartOffsetHours = this.getHoursFromClipOffsetValue(prevStartOffset);
    const newStartOffset = prevStartOffset - (prevStartOffsetHours * 3600) + (hours * 3600);
    clips[clipIndex].startOffset = newStartOffset;
    if (clipIndex > 0) {
      clips[clipIndex - 1].endOffset = newStartOffset;
    }
    this.setState({
      videos: updatePropertyInArray(this.props.videos, videoIndex, clips, 'clips')
    });
  }

  handleClipOffsetMinutesChange(videoIndex, clipIndex, minutes) {
    minutes = minutes ? parseInt(minutes) : 0;
    const clips = this.state.videos[videoIndex].clips;
    const prevStartOffset = clips[clipIndex].startOffset;
    const prevStartOffsetMinutes = this.getMinutesFromClipOffsetValue(prevStartOffset);
    const newStartOffset = prevStartOffset - (prevStartOffsetMinutes * 60) + (minutes * 60);
    clips[clipIndex].startOffset = newStartOffset;
    if (clipIndex > 0) {
      clips[clipIndex - 1].endOffset = newStartOffset;
    }
    this.setState({
      videos: updatePropertyInArray(this.props.videos, videoIndex, clips, 'clips')
    });
  }

  handleClipOffsetSecondsChange(videoIndex, clipIndex, seconds) {
    seconds = seconds ? parseInt(seconds) : 0;
    const clips = this.state.videos[videoIndex].clips;
    const prevStartOffset = clips[clipIndex].startOffset;
    const prevStartOffsetSeconds = this.getSecondsFromClipOffsetValue(prevStartOffset);
    const newStartOffset = prevStartOffset - prevStartOffsetSeconds + (seconds);
    clips[clipIndex].startOffset = newStartOffset;
    if (clipIndex > 0) {
      clips[clipIndex - 1].endOffset = newStartOffset;
    }
    this.setState({
      videos: updatePropertyInArray(this.props.videos, videoIndex, clips, 'clips')
    });
  }

  handleAddVideoClip(video, videoIndex) {
    if (!video.clips || !Array.isArray(video.clips)) {
      video.clips = [];
    }
    video.clips.push({
      name: {
        no: '',
        en: ''
      },
      startOffset: video.clips.length > 0 ? video.clips[video.clips.length - 1].startOffset : 0,
      endOffset: this.getOffsetValueFromDuration(video.duration),
    })

    this.handleClipsChange(videoIndex, video.clips);

  }

  renderVideoClipsList(video, videoIndex) {
    const videoClipsElements = video.clips?.length
      ? video.clips.map((clip, clipIndex) => {
        return (
          <div key={clipIndex} className={commonStyle.formElement}>
            <label htmlFor={`clips-name-no-${videoIndex}-${clipIndex}`}>
              Norwegian name
              <input type="text" id={`clips-name-no-${videoIndex}-${clipIndex}`} value={clip.name.no} onChange={event => this.handleClipNameChange(videoIndex, clipIndex, event.target.value, 'no')} onBlur={this.updateVideosInStore}/>
            </label>
            <label htmlFor={`clips-name-en-${videoIndex}-${clipIndex}`}>
              English name
              <input type="text" id={`clips-name-en-${videoIndex}-${clipIndex}`} value={clip.name.en} onChange={event => this.handleClipNameChange(videoIndex, clipIndex, event.target.value, 'en')} onBlur={this.updateVideosInStore}/>
            </label>
            <label htmlFor={`clips-startOffset-hours-${videoIndex}-${clipIndex}`} style={{maxWidth: '70px'}}>
              Hours
              <input type="number" min="0" id={`clips-startOffset-hours-${videoIndex}-${clipIndex}`} value={this.getHoursFromClipOffsetValue(clip.startOffset)} onChange={event => this.handleClipOffsetHoursChange(videoIndex, clipIndex, event.target.value)} onBlur={this.updateVideosInStore}/>
            </label>
            <label htmlFor={`clips-startOffset-minutes-${videoIndex}-${clipIndex}`} style={{maxWidth: '70px'}}>
              Minutes
              <input type="number" min="0" max="60" id={`clips-startOffset-minutes-${videoIndex}-${clipIndex}`} value={this.getMinutesFromClipOffsetValue(clip.startOffset)} onChange={event => this.handleClipOffsetMinutesChange(videoIndex, clipIndex, event.target.value)} onBlur={this.updateVideosInStore}/>
            </label>
            <label htmlFor={`clips-startOffset-seconds-${videoIndex}-${clipIndex}`} style={{maxWidth: '70px'}}>
              Seconds
              <input type="number" min="0" max="60" id={`clips-startOffset-seconds-${videoIndex}-${clipIndex}`} value={this.getSecondsFromClipOffsetValue(clip.startOffset)} onChange={event => this.handleClipOffsetSecondsChange(videoIndex, clipIndex, event.target.value)} onBlur={this.updateVideosInStore}/>
            </label>
            <label htmlFor={`duration-${clipIndex}`} style={{maxWidth: '100px'}}>
              Period
              <span id={`duration-${clipIndex}`}>
                {clip.startOffset} - {clip.endOffset}
              </span>
            </label>
          </div>
        )
      })
      : '';
    return (
      <details>
        <summary>Clips {video.clips?.length || ''}</summary>
        {videoClipsElements}
        <button onClick={() => this.handleAddVideoClip(video, videoIndex)} className={commonStyle.fullWidthButton}>
          <FontAwesomeIcon icon={['fas', 'plus']} /> Add clip
        </button>
      </details>
    )
  }

  renderVideosFields(videos) {
    return videos && videos.length
      ? videos.map((video, index) => {
        return (
          <div key={index} className={commonStyle.formListElement}>
            <span className={commonStyle.formElementGroupTitle}>Identifiers</span>
            <div className={commonStyle.formElement}>
              <label htmlFor={`timestamp-${index}`}>
                Timestamp
                <DatePicker
                  id={`timestamp-${index}`}
                  locale="nb"
                  onChange={event => this.handleTimestampChange(index, event)}
                  selected={video.timestamp}
                  className={commonStyle.input} />
              </label>
              <label htmlFor={`orderNumber-${index}`}>
                Order no.
                <input type="number" id={`orderNumber-${index}`} min="0" value={video.orderNumber ? video.orderNumber : 0} onChange={event => this.handleOrderNumberChange(index, event.target.value)} />
              </label>
              <label htmlFor={`id-${index}`}>
                ID
                <span id={`id-${index}`}>
                  {video.id}
                </span>
              </label>
              <label htmlFor={`thumbnailFilename-${index}`}>
                Image filename
                <span id={`thumbnailFilename-${index}`}>
                  {video.thumbnailFilename}_[filesize].[filetype]
                </span>
              </label>
            </div>

            <span className={commonStyle.formElementGroupTitle}>Title</span>
            <div className={commonStyle.formElement}>
              <label htmlFor={`title-no-${index}`}>
                Norwegian
                <input type="text" id={`title-no-${index}`} value={video.title.no} onChange={event => this.handleTitleChange(index, event.target.value, 'no')} onBlur={this.updateVideosInStore} />
              </label>
              <label htmlFor={`title-en-${index}`}>
                English
                <input type="text" id={`title-en-${index}`} value={video.title.en} onChange={event => this.handleTitleChange(index, event.target.value, 'en')} onBlur={this.updateVideosInStore} />
              </label>
            </div>

            <span className={commonStyle.formElementGroupTitle}>Content</span>
            <div className={commonStyle.formElement}>
              <label htmlFor={`content-no-${index}`}>
                Norwegian
                <textarea id={`content-no-${index}`} value={video.content.no} onChange={event => this.handleContentChange(index, event.target.value, 'no')} onBlur={this.updateVideosInStore}></textarea>
              </label>
              <label htmlFor={`content-en-${index}`}>
                English
                <textarea id={`content-en-${index}`} value={video.content.en} onChange={event => this.handleContentChange(index, event.target.value, 'en')} onBlur={this.updateVideosInStore}></textarea>
              </label>
            </div>


            <span className={commonStyle.formElementGroupTitle}>Image</span>
            <div className={commonStyle.formElement}>
              <label htmlFor={`thumbnailDescription-${index}`}>
                Image description
                <input type="text" id={`thumbnailDescription-${index}`} value={video.thumbnailDescription} onChange={event => this.handleThumbnailDescriptionChange(index, event.target.value)} onBlur={this.updateVideosInStore} />
              </label>
              <label htmlFor={`thumbnailDescription-${index}`}>
                Image copyright
                <input type="checkbox" id={`copyright-${index}`} checked={video.copyright} onChange={event => this.handleCopyrightChange(index, event.target.checked)} onBlur={this.updateVideosInStore} />
              </label>
            </div>

            <span className={commonStyle.formElementGroupTitle}>YouTube</span>
            <div className={commonStyle.formElement}>
              <label htmlFor={`youTubeChannelId-${index}`}>
                Channel ID
                <input type="text" id={`youTubeChannelId-${index}`} value={video.youTubeChannelId} onChange={event => this.handleYouTubeChannelIdChange(index, event.target.value)} onBlur={this.updateVideosInStore} />
              </label>
              <label htmlFor={`youTubeUser-${index}`}>
                User ID
                <input type="text" id={`youTubeUser-${index}`} value={video.youTubeUser} onChange={event => this.handleYouTubeUserChange(index, event.target.value)} onBlur={this.updateVideosInStore} />
              </label>
              <label htmlFor={`youTubeId-${index}`}>
                Video ID
                <input type="text" id={`youTubeId-${index}`} value={video.youTubeId} onChange={event => this.handleYouTubeIdChange(index, event.target.value)} onBlur={this.updateVideosInStore} />
              </label>
            </div>

            <span className={commonStyle.formElementGroupTitle}>Duration</span>
            <div className={commonStyle.formElement}>
              <label htmlFor={`duration-hours${index}`}>
                Hours
                <input type="number" min="0" id={`duration-hours-${index}`} value={this.getHoursFromDuration(video.duration)} onChange={event => this.handleDurationHoursChange(index, event.target.value)} onBlur={this.updateVideosInStore} />
              </label>
              <label htmlFor={`duration-minutes${index}`}>
                Minutes
                <input type="number" min="0" max="60" id={`duration-minutes-${index}`} value={this.getMinutesFromDuration(video.duration)} onChange={event => this.handleDurationMinutesChange(index, event.target.value)} onBlur={this.updateVideosInStore} />
              </label>
              <label htmlFor={`duration-seconds${index}`}>
                Seconds
                <input type="number" min="0" max="60" id={`duration-seconds-${index}`} value={this.getSecondsFromDuration(video.duration)} onChange={event => this.handleDurationSecondsChange(index, event.target.value)} onBlur={this.updateVideosInStore} />
              </label>
              <label htmlFor={`duration-${index}`}>
                YouTube duration
                <span id={`duration-${index}`}>
                  {video.duration}
                </span>
              </label>
            </div>

            {this.renderVideoClipsList(video, index)}

          </div>
        )
      }) : '';
  }

  render() {
    return (<div className={style.contentSection}>
      <Helmet>
        <title>Videos - Dashboard - Dehli Musikk</title>
      </Helmet>
      <h1>Videos</h1>
      {this.props.videos ? this.renderVideosFields(this.props.videos) : ''}
      <ActionButtonBar>
        <button onClick={this.createVideoInStore} className={commonStyle.bgGreen}><FontAwesomeIcon icon={['fas', 'plus']} /> Add</button>
        <button onClick={() => this.saveFileContent(this.props.videos, true)} className={commonStyle.bgBlue}><FontAwesomeIcon icon={['fas', 'download']} /> Latest</button>
        <button onClick={() => this.saveFileContent(this.props.videos, false)} className={commonStyle.bgBlue}><FontAwesomeIcon icon={['fas', 'download']} /> All</button>
      </ActionButtonBar>
    </div>)
  }
}

const mapStateToProps = state => ({ videos: state.videos });

const mapDispatchToProps = {
  createVideo,
  updateVideos
};

export default connect(mapStateToProps, mapDispatchToProps)(Videos);
