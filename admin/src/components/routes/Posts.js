// Dependencies
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Helmet } from 'react-helmet';
import DatePicker from 'react-datepicker';
import { registerLocale } from "react-datepicker";
import nb from 'date-fns/locale/nb';
import { saveAs } from 'file-saver';

// Actions
import { updatePosts } from 'actions/PostsActions';

// Helpers
import { updatePropertyInArray, updateMultilingualPropertyInArray, getOrderNumberString, getGeneratedIdByDate, getGeneratedFilenameByDate } from 'helpers/objectHelpers';

// Stylesheets
import style from 'components/routes/Dashboard.module.scss';
import commonStyle from 'components/routes/commonStyle.module.scss';
import "react-datepicker/dist/react-datepicker.css";

registerLocale('nb', nb)


class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      posts: null
    }
    this.updatePostsInStore = this.updatePostsInStore.bind(this);
  }

  componentDidMount() {
    this.setState({
      posts: this.props.posts
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
    const post = this.props.posts[index];
    const date = new Date(post.timestamp);
    const orderNumberString = getOrderNumberString(orderNumber);
    const thumbnailFilename = getGeneratedFilenameByDate(date, orderNumberString);
    const id = getGeneratedIdByDate(date, orderNumberString);
    this.setState({
      posts: updatePropertyInArray(this.props.posts, index, parseInt(orderNumber), 'orderNumber')
    });
    this.setState({
      posts: updatePropertyInArray(this.props.posts, index, thumbnailFilename, 'thumbnailFilename')
    });
    this.setState({
      posts: updatePropertyInArray(this.props.posts, index, id, 'id')
    });
  }

  handleTimestampChange(index, value) {
    const post = this.props.posts[index];
    const orderNumberString = getOrderNumberString(post.orderNumber);
    const thumbnailFilename = getGeneratedFilenameByDate(value, orderNumberString);
    const id = getGeneratedIdByDate(value, orderNumberString);
    this.setState({
      posts: updatePropertyInArray(this.props.posts, index, value.valueOf(), 'timestamp')
    });
    this.setState({
      posts: updatePropertyInArray(this.props.posts, index, thumbnailFilename, 'thumbnailFilename')
    });
    this.setState({
      posts: updatePropertyInArray(this.props.posts, index, id, 'id')
    });
    this.updatePostsInStore();
  }

  handleTitleChange(index, value, language) {
    this.setState({
      posts: updateMultilingualPropertyInArray(this.props.posts, index, value, 'title', language)
    });
  }

  handleContentChange(index, value, language) {
    this.setState({
      posts: updateMultilingualPropertyInArray(this.props.posts, index, value, 'content', language)
    });
  }

  handleThumbnailFilenameChange(index, value) {
    this.setState({
      posts: updatePropertyInArray(this.props.posts, index, value, 'thumbnailFilename')
    });
  }

  handleThumbnailDescriptionChange(index, value) {
    this.setState({
      posts: updatePropertyInArray(this.props.posts, index, value, 'thumbnailDescription')
    });
  }

  handleCopyrightChange(index, value) {
    this.setState({
      posts: updatePropertyInArray(this.props.posts, index, value, 'copyright')
    });
  }


  generateNewPostId(index, postDate, posts) {

  }

  updatePostsInStore() {
    this.props.updatePosts(this.state.posts);
  }

  renderPostsFields(posts) {
    return posts && posts.length
      ? posts.map((post, index) => {
        return (
          <div key={index} className={commonStyle.formListElement}>
            <div className={commonStyle.formElement}>
              <label htmlFor={`timestamp-${index}`}>
                Timestamp
                <DatePicker
                  id={`timestamp-${index}`}
                  locale="nb"
                  onChange={event => this.handleTimestampChange(index, event)}
                  selected={post.timestamp}
                  className={commonStyle.input} />
              </label>
              <label htmlFor={`orderNumber-${index}`}>
                Order no.
                <input type="number" id={`orderNumber-${index}`} min="0" value={post.orderNumber ? post.orderNumber : 0} onChange={event => this.handleOrderNumberChange(index, event.target.value)} />
              </label>
              <label htmlFor={`id-${index}`}>
                ID
                <input type="text" readOnly id={`id-${index}`} value={post.id} onChange={event => this.handleIdChange(index, event.target.value)} />
              </label>
              <label htmlFor={`thumbnailFilename-${index}`}>
                Image filename
                <input type="text" readOnly id={`thumbnailFilename-${index}`} value={post.thumbnailFilename} onChange={event => this.handleThumbnailFilenameChange(index, event.target.value)} onBlur={this.updatePostsInStore} />
              </label>
            </div>

            <span className={commonStyle.formElementGroupTitle}>Tittel</span>
            <div className={commonStyle.formElement}>
              <label htmlFor={`title-no-${index}`}>
                Norwegian
                <input type="text" id={`title-no-${index}`} value={post.title.no} onChange={event => this.handleTitleChange(index, event.target.value, 'no')} onBlur={this.updatePostsInStore} />
              </label>
              <label htmlFor={`title-en-${index}`}>
                English
                <input type="text" id={`title-en-${index}`} value={post.title.en} onChange={event => this.handleTitleChange(index, event.target.value, 'en')} onBlur={this.updatePostsInStore} />
              </label>
            </div>

            <span className={commonStyle.formElementGroupTitle}>Beskrivelse</span>
            <div className={commonStyle.formElement}>
              <label htmlFor={`content-no-${index}`}>
                Norwegian
                <textarea id={`content-no-${index}`} value={post.content.no} onChange={event => this.handleContentChange(index, event.target.value, 'no')} onBlur={this.updatePostsInStore}></textarea>
              </label>
              <label htmlFor={`content-en-${index}`}>
                English
                <textarea id={`content-en-${index}`} value={post.content.en} onChange={event => this.handleContentChange(index, event.target.value, 'en')} onBlur={this.updatePostsInStore}></textarea>
              </label>
            </div>

            <div className={commonStyle.formElement}>
              
              <label htmlFor={`thumbnailDescription-${index}`}>
                Image description
                <input type="text" id={`thumbnailDescription-${index}`} value={post.thumbnailDescription} onChange={event => this.handleThumbnailDescriptionChange(index, event.target.value)} onBlur={this.updatePostsInStore} />
              </label>
              <label htmlFor={`thumbnailDescription-${index}`}>
                Image copyright
                <input type="checkbox" id={`copyright-${index}`} checked={post.copyright} onChange={event => this.handleCopyrightChange(index, event.target.checked)} onBlur={this.updatePostsInStore} />
              </label>
            </div>

          </div>
        )
      }) : '';
  }

  render() {
    return (<div className={style.contentSection}>
      <Helmet>
        <title>Innlegg - Dashboard - Dehli Musikk</title>
      </Helmet>
      <h1>Innlegg</h1>
      <button onClick={() => this.saveFileContent(this.props.posts)}>Save</button>
      {this.props.posts ? this.renderPostsFields(this.props.posts) : ''}
    </div>)
  }
}

const mapStateToProps = state => ({ posts: state.posts });

const mapDispatchToProps = {
  updatePosts
};

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);
