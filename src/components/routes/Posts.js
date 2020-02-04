// Dependencies
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Helmet} from 'react-helmet';
import {Redirect} from 'react-router-dom';

// Components
import Post from 'components/partials/Post';
import Breadcrumbs from 'components/partials/Breadcrumbs';
import Modal from 'components/partials/Modal';

// Actions
import {getLanguageSlug, updateMultilingualRoutes, updateSelectedLanguageKey} from 'actions/LanguageActions';

// Helpers
import {convertToUrlFriendlyString} from 'helpers/urlFormatter'

// Data
import {allPosts} from 'data/posts';

// Stylesheets
import style from 'components/routes/Posts.module.scss';

class Posts extends Component {

  constructor(props) {
    super(props);
    this.state = {
      redirect: null
    };
  }

  initLanguage() {
    const selectedPostId = this.props.match && this.props.match.params && this.props.match.params.postId
      ? this.props.match.params.postId
      : null;
    this.props.updateMultilingualRoutes(
      selectedPostId
      ? `posts/${selectedPostId}/`
      : 'posts/');
    const selectedLanguageKey = this.props.match && this.props.match.params && this.props.match.params.selectedLanguage
      ? this.props.match.params.selectedLanguage
      : 'no';
    if (selectedLanguageKey !== this.props.selectedLanguageKey) {
      this.props.updateSelectedLanguageKey(selectedLanguageKey);
    }
  }

  componentDidMount() {
    this.initLanguage();
  }

  componentDidUpdate() {
    if (this.state.redirect) {
      this.setState({redirect: null});
    }
  }

  renderPosts() {
    return allPosts && allPosts.length
      ? allPosts.map(post => {
        return <Post key={post.id} post={post}/>
      })
      : '';
  }

  renderSelectedPost(selectedPost) {
    const handleClickOutside = () => {
      this.setState({
        redirect: `/${this.props.getLanguageSlug(this.props.selectedLanguageKey)}posts/`
      });
    }
    return selectedPost
      ? (<Modal onClickOutside={handleClickOutside} maxWidth="540px">
        <Post post={selectedPost} fullscreen={true}/>
      </Modal>)
      : '';
  }

  getSelectedPost(selectedPostId, selectedLanguageKey) {
    return allPosts.find(post => {
      const postId = convertToUrlFriendlyString(post.title[selectedLanguageKey])
      return postId === selectedPostId
    });
  }

  render() {
    const selectedPostId = this.props.match && this.props.match.params && this.props.match.params.postId
      ? this.props.match.params.postId
      : null;
    const selectedPost = selectedPostId
      ? this.getSelectedPost(selectedPostId, this.props.selectedLanguageKey)
      : null;

    const listPage = {
      title: {
        en: 'Posts | Dehli Musikk',
        no: 'Innlegg | Dehli Musikk'
      },
      heading: {
        en: 'Posts',
        no: 'Innlegg'
      },
      description: {
        en: 'Latest update from Dehli Musikk',
        no: 'Siste oppdateringer fra Dehli Musikk'
      }
    }

    const detailsPage = {
      title: {
        en: `${selectedPost
          ? selectedPost.title.en
          : ''} - Posts | Dehli Musikk`,
        no: `${selectedPost
          ? selectedPost.title.no
          : ''} - Innlegg | Dehli Musikk`
      },
      heading: {
        en: selectedPost
          ? selectedPost.title.en
          : '',
        no: selectedPost
          ? selectedPost.title.no
          : ''
      },
      description: {
        en: selectedPost
          ? selectedPost.content.en
          : '',
        no: selectedPost
          ? selectedPost.content.no
          : ''
      }
    }

    let breadcrumbs = [
      {
        name: listPage.heading[this.props.selectedLanguageKey],
        path: `/${this.props.getLanguageSlug(this.props.selectedLanguageKey)}posts/`
      }
    ];
    if (selectedPost) {
      breadcrumbs.push({
        name: detailsPage.heading[this.props.selectedLanguageKey],
        path: `/${this.props.getLanguageSlug(this.props.selectedLanguageKey)}posts/${selectedPostId}/`
      })
    }

    if (this.state.redirect) {
      return <Redirect to={this.state.redirect}/>;
    } else {
      const selectedPostMultilingualIds = {
        en: selectedPost
          ? convertToUrlFriendlyString(selectedPost.title.en)
          : '',
        no: selectedPost
          ? convertToUrlFriendlyString(selectedPost.title.no)
          : ''
      };
      const metaTitle = selectedPost
        ? detailsPage.title[this.props.selectedLanguageKey]
        : listPage.title[this.props.selectedLanguageKey];
      const contentTitle = selectedPost
        ? detailsPage.heading[this.props.selectedLanguageKey]
        : listPage.heading[this.props.selectedLanguageKey];
      const metaDescription = selectedPost
        ? detailsPage.description[this.props.selectedLanguageKey]
        : listPage.description[this.props.selectedLanguageKey];
      return (<div className={style.container}>
        <Helmet htmlAttributes={{
            lang: this.props.selectedLanguageKey
          }}>
          <title>{metaTitle}</title>
          <meta name='description' content={metaDescription}/>
          <link rel="canonical" href={`https://www.dehlimusikk.no/${this.props.getLanguageSlug(this.props.selectedLanguageKey)}posts/${selectedPost
              ? selectedPostId + '/'
              : ''}`}/>
          <link rel="alternate" href={`https://www.dehlimusikk.no/posts/${selectedPost
              ? selectedPostMultilingualIds.no + '/'
              : ''}`} hreflang="no"/>
          <link rel="alternate" href={`https://www.dehlimusikk.no/en/posts/${selectedPost
              ? selectedPostMultilingualIds.en + '/'
              : ''}`} hreflang="en"/>
          <link rel="alternate" href={`https://www.dehlimusikk.no/posts/${selectedPost
              ? selectedPostMultilingualIds.no + '/'
              : ''}`} hreflang="x-default"/>
          <meta property="og:title" content={contentTitle}/>
          <meta property="og:url" content={`https://www.dehlimusikk.no/${this.props.getLanguageSlug(this.props.selectedLanguageKey)}posts/${selectedPost
              ? selectedPostId + '/'
              : ''}`}/>
          <meta property="og:description" content={metaDescription}/>
          <meta property="og:locale" content={this.props.selectedLanguageKey === 'en'
              ? 'en_US'
              : 'no_NO'}/>
          <meta property="og:locale:alternate" content={this.props.selectedLanguageKey === 'en'
              ? 'nb_NO'
              : 'en_US'}/>
        </Helmet>
        <div className={`padding ${selectedPost
            ? style.blur
            : ''}`}>
          <Breadcrumbs breadcrumbs={breadcrumbs}/>
          <h1>{contentTitle}</h1>
          <p>{
              this.props.selectedLanguageKey === 'en'
                ? 'Updates from Dehli Musikk'
                : 'Oppdateringer fra Dehli Musikk'
            }</p>
        </div>
        {
          selectedPost
            ? this.renderSelectedPost(selectedPost)
            : ''
        }
        <div className={`${style.posts} ${selectedPost
            ? style.blur
            : ''} padding-sm`}>
          <div className={style.grid}>
            {this.renderPosts()}
          </div>
        </div>
      </div>)
    }
  }
}

const mapStateToProps = state => ({selectedLanguageKey: state.selectedLanguageKey});

const mapDispatchToProps = {
  getLanguageSlug,
  updateMultilingualRoutes,
  updateSelectedLanguageKey
};

export default connect(mapStateToProps, mapDispatchToProps)(Posts);
