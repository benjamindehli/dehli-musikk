// Dependencies
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Helmet } from 'react-helmet';
import DatePicker from 'react-datepicker';
import { registerLocale } from "react-datepicker";
import nb from 'date-fns/locale/nb';
import { saveAs } from 'file-saver';

// Actions
import { updateVideos } from 'actions/VideosActions';

// Helpers
import { updatePropertyInArray, updateMultilingualPropertyInArray, getOrderNumberString, getGeneratedIdByDate, getGeneratedFilenameByDate } from 'helpers/objectHelpers';

// Stylesheets
import style from 'components/routes/Dashboard.module.scss';
import commonStyle from 'components/routes/commonStyle.module.scss';
import "react-datepicker/dist/react-datepicker.css";

registerLocale('nb', nb)


class Videos extends Component {
  constructor(props) {
    super(props);
    this.state = {
      videos: null
    }
    this.updateVideosInStore = this.updateVideosInStore.bind(this);
  }

  componentDidMount() {
    this.setState({
      videos: this.props.videos
    });
  }

  saveFileContent(fileContent) {
    var filename = "latest.json";
    var contentString = JSON.stringify(fileContent);
    var blob = new Blob([contentString], {
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


  generateNewPostId(index, videoDate, videos) {

  }

  updateVideosInStore() {
    this.props.updateVideos(this.state.videos);
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
      <button onClick={() => this.saveFileContent(this.props.videos)}>Save</button>
      {this.props.videos ? this.renderVideosFields(this.props.videos) : ''}
    </div>)
  }
}

const mapStateToProps = state => ({ videos: state.videos });

const mapDispatchToProps = {
  updateVideos
};

export default connect(mapStateToProps, mapDispatchToProps)(Videos);
