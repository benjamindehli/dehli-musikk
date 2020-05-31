// Dependencies
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Helmet} from 'react-helmet';
import {Redirect} from 'react-router-dom';

// Components
import Post from 'components/partials/Post';
import Breadcrumbs from 'components/partials/Breadcrumbs';

// Template
import Container from 'components/template/Container';
import List from 'components/template/List';
import ListItem from 'components/template/List/ListItem';
import Modal from 'components/template/Modal';

// Actions
import {getLanguageSlug, updateMultilingualRoutes, updateSelectedLanguageKey} from 'actions/LanguageActions';

// Helpers
import {convertToUrlFriendlyString} from 'helpers/urlFormatter'

// Data
import posts from 'data/posts';


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

  componentDidUpdate(prevProps) {
    if (this.state.redirect) {
      this.setState({redirect: null});
    }
    if (this.props.location.pathname !== prevProps.location.pathname){
      this.initLanguage();
    }
  }

  renderPosts() {
    return posts && posts.length
      ? posts.map(post => {
        return (<ListItem key={post.id} fullscreen={this.props.fullscreen}>
          <Post post={post}/>
        </ListItem>)
      })
      : '';
  }

  renderSelectedPost(selectedPost) {
    const handleClickOutside = () => {
      this.setState({
        redirect: `/${this.props.getLanguageSlug(this.props.selectedLanguageKey)}posts/`
      });
    }
    const handleClickArrowLeft = selectedPost && selectedPost.previousPostId ? () => {
      this.setState({
        redirect: `/${this.props.getLanguageSlug(this.props.selectedLanguageKey)}posts/${selectedPost.previousPostId}/`
      });
    } : null;
    const handleClickArrowRight = selectedPost && selectedPost.nextPostId ? () => {
      this.setState({
        redirect: `/${this.props.getLanguageSlug(this.props.selectedLanguageKey)}posts/${selectedPost.nextPostId}/`
      });
    } : null;
    return selectedPost
      ? (<Modal onClickOutside={handleClickOutside} maxWidth="540px" onClickArrowLeft={handleClickArrowLeft} onClickArrowRight={handleClickArrowRight}>
        <Post post={selectedPost} fullscreen={true}/>
      </Modal>)
      : '';
  }

  getSelectedPost(selectedPostId, selectedLanguageKey) {
    let selectedPost = null;
    posts.forEach((post, index) => {
      const postId = convertToUrlFriendlyString(post.title[selectedLanguageKey])
      if (postId === selectedPostId) {
        selectedPost = {
          ...post,
          previousPostId: index > 0 ? convertToUrlFriendlyString(posts[index-1].title[selectedLanguageKey]) : null,
          nextPostId: index < posts.length-1 ? convertToUrlFriendlyString(posts[index+1].title[selectedLanguageKey]) : null
        }
      }
    });
    return selectedPost;
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
      return (<React.Fragment>
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
          <meta property="twitter:title" content={contentTitle} />
          <meta property="twitter:description" content={metaDescription} />
        </Helmet>
        <Container blur={selectedPost !== null}>
          <Breadcrumbs breadcrumbs={breadcrumbs}/>
          <h1>{contentTitle}</h1>
          <p>{
              this.props.selectedLanguageKey === 'en'
                ? 'Updates from Dehli Musikk'
                : 'Oppdateringer fra Dehli Musikk'
            }</p>
        </Container>
        {
          selectedPost ? this.renderSelectedPost(selectedPost) : ''
        }
        <Container blur={selectedPost !== null}>
          <List>
            {this.renderPosts()}
          </List>
        </Container>
      </React.Fragment>)
    }
  }
}

const mapStateToProps = state => ({selectedLanguageKey: state.selectedLanguageKey, location: state.router.location});

const mapDispatchToProps = {
  getLanguageSlug,
  updateMultilingualRoutes,
  updateSelectedLanguageKey
};

export default connect(mapStateToProps, mapDispatchToProps)(Posts);
