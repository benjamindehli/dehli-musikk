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
import { createPost, updatePosts } from 'actions/PostsActions';

// Helpers
import { updatePropertyInArray, updateMultilingualPropertyInArray, getOrderNumberString, getGeneratedIdByDate, getGeneratedFilenameByDate } from 'helpers/objectHelpers';

// Stylesheets
import style from 'components/routes/Dashboard.module.scss';
import commonStyle from 'components/partials/commonStyle.module.scss';
import "react-datepicker/dist/react-datepicker.css";

registerLocale('nb', nb)


class Posts extends Component {
  constructor(props) {
    super(props);
    this.state = {
      posts: null
    }
    this.createPostInStore = this.createPostInStore.bind(this);
    this.updatePostsInStore = this.updatePostsInStore.bind(this);
  }

  componentDidMount() {
    this.setState({
      posts: this.props.posts
    });
  }

  saveFileContent(fileContent, latest = true) {
    const filename = latest ? "latest.json" : 'all.json';
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

  handleLinkInternalChange(index, internal) {
    let newPosts = this.props.posts;
    newPosts[index].link.internal = internal;
    newPosts[index].link.url = internal ? { en: '', no: '' } : '';
    this.setState({
      posts: newPosts
    });
  }

  handleLinkUrlChange(index, url, language) {
    let newPosts = this.props.posts;
    if (language && language.length){
      newPosts[index].link.url[language] = url;
    } else {
      newPosts[index].link.url = url;
    }
    this.setState({
      posts: newPosts
    });
  }

  handleLinkTextChange(index, text, language) {
    let newPosts = this.props.posts;
    newPosts[index].link.text[language] = text;
    this.setState({
      posts: newPosts
    });
  }

  addLink(index) {
    let newPosts = this.props.posts;
    newPosts[index].link = {
      url: '',
      text: {
        en: '',
        no: ''
      }
    };
    this.setState({
      posts: newPosts
    });
  }

  removeLink(index) {
    let newPosts = this.props.posts;
    delete newPosts[index].link;
    this.setState({
      posts: newPosts
    });
  }

  createPostInStore() {
    this.props.createPost(this.state.posts);
    this.setState({
      posts: this.props.posts
    });
  }

  updatePostsInStore() {
    this.props.updatePosts(this.state.posts);
  }

  renderPostsFields(posts) {
    return posts && posts.length
      ? posts.map((post, index) => {
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
                  selected={post.timestamp}
                  className={commonStyle.input} />
              </label>
              <label htmlFor={`orderNumber-${index}`}>
                Order no.
                <input type="number" id={`orderNumber-${index}`} min="0" value={post.orderNumber ? post.orderNumber : 0} onChange={event => this.handleOrderNumberChange(index, event.target.value)} />
              </label>
              <label htmlFor={`id-${index}`}>
                ID
                <span id={`id-${index}`}>
                  {post.id}
                </span>
              </label>
              <label htmlFor={`thumbnailFilename-${index}`}>
                Image filename
                <span id={`thumbnailFilename-${index}`}>
                  {post.thumbnailFilename}_[filesize].[filetype]
                </span>
              </label>
            </div>

            <span className={commonStyle.formElementGroupTitle}>Title</span>
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

            <span className={commonStyle.formElementGroupTitle}>Content</span>
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


            <span className={commonStyle.formElementGroupTitle}>Image</span>
            <div className={commonStyle.formElement}>
              <label htmlFor={`thumbnailDescription-${index}`}>
                Image description
                <input type="text" id={`thumbnailDescription-${index}`} value={post.thumbnailDescription} onChange={event => this.handleThumbnailDescriptionChange(index, event.target.value)} onBlur={this.updatePostsInStore} />
              </label>
              <label htmlFor={`copyright-${index}`}>
                Image copyright
                <input type="checkbox" id={`copyright-${index}`} checked={post.copyright ? true : false} onChange={event => this.handleCopyrightChange(index, event.target.checked)} onBlur={this.updatePostsInStore} />
              </label>
            </div>

            {
              post.link && Object.keys(post.link).length
                ? (
                  <React.Fragment>
                    <span className={commonStyle.formElementGroupTitle}>Link</span>
                    <div className={commonStyle.formElement}>
                      <label htmlFor={`link-internal-${index}`} style={{ width: '100px' }}>
                        Internal
                        <input type="checkbox" id={`link-internal-${index}`} checked={post.link.internal ? true : false} onChange={event => this.handleLinkInternalChange(index, event.target.checked)} onBlur={this.updatePostsInStore} />
                      </label>
                      {
                        post.link.internal
                          ? (
                            <React.Fragment>
                              <label htmlFor={`link-url-no-${index}`}>
                                Norwegian URL
                                <input type="text" id={`link-url-no-${index}`} value={post.link.url.no} onChange={event => this.handleLinkUrlChange(index, event.target.value, 'no')} onBlur={this.updatePostsInStore} />
                              </label>
                              <label htmlFor={`link-url-en-${index}`}>
                                English URL
                                <input type="text" id={`link-url-en-${index}`} value={post.link.url.en} onChange={event => this.handleLinkUrlChange(index, event.target.value, 'en')} onBlur={this.updatePostsInStore} />
                              </label>
                            </React.Fragment>)
                          : (
                            <React.Fragment>
                              <label htmlFor={`link-url-${index}`}>
                                URL
                                <input type="text" id={`link-url-${index}`} value={post.link.url} onChange={event => this.handleLinkUrlChange(index, event.target.value)} onBlur={this.updatePostsInStore} />
                              </label>
                            </React.Fragment>)
                      }
                    </div>
                    <div className={commonStyle.formElement}>
                      <label htmlFor={`link-text-no-${index}`}>
                        Norwegian link text
                        <input type="text" id={`link-text-no-${index}`} value={post.link.text.no} onChange={event => this.handleLinkTextChange(index, event.target.value, 'no')} onBlur={this.updatePostsInStore} />
                      </label>
                      <label htmlFor={`link-text-en-${index}`}>
                        English link text
                        <input type="text" id={`link-text-en-${index}`} value={post.link.text.en} onChange={event => this.handleLinkTextChange(index, event.target.value, 'en')} onBlur={this.updatePostsInStore} />
                      </label>
                    </div>

                  </React.Fragment>)
                : ''
            }
            <div className={commonStyle.buttonBar}>
              {
                post.link && Object.keys(post.link).length
                  ? (<button className={commonStyle.bgRed} onClick={() => this.removeLink(index)}><FontAwesomeIcon icon={['fas', 'unlink']} /></button>)
                  : (<button className={commonStyle.bgGreen} onClick={() => this.addLink(index)}><FontAwesomeIcon icon={['fas', 'link']} /></button>)
              }
            </div>
          </div>
        )
      }) : '';
  }

  render() {
    return (<div className={style.contentSection}>
      <Helmet>
        <title>Posts - Dashboard - Dehli Musikk</title>
      </Helmet>
      <h1>Posts</h1>
      {this.props.posts ? this.renderPostsFields(this.props.posts) : ''}
      <ActionButtonBar>
        <button onClick={this.createPostInStore} className={commonStyle.bgGreen}><FontAwesomeIcon icon={['fas', 'plus']} /> Add</button>
        <button onClick={() => this.saveFileContent(this.props.posts, true)} className={commonStyle.bgBlue}><FontAwesomeIcon icon={['fas', 'download']} /> Latest</button>
        <button onClick={() => this.saveFileContent(this.props.posts, false)} className={commonStyle.bgBlue}><FontAwesomeIcon icon={['fas', 'download']} /> All</button>
      </ActionButtonBar>
    </div>)
  }
}

const mapStateToProps = state => ({ posts: state.posts });

const mapDispatchToProps = {
  createPost,
  updatePosts
};

export default connect(mapStateToProps, mapDispatchToProps)(Posts);
