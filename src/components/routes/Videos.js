// Dependencies
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Helmet} from 'react-helmet';
import {Redirect} from 'react-router-dom';

// Components
import Breadcrumbs from 'components/partials/Breadcrumbs';
import Container from 'components/template/Container';
import List from 'components/template/List';
import ListItem from 'components/template/List/ListItem';
import Modal from 'components/template/Modal';
import Video from 'components/partials/Video';

// Actions
import {getLanguageSlug, updateMultilingualRoutes, updateSelectedLanguageKey} from 'actions/LanguageActions';

// Helpers
import {convertToUrlFriendlyString} from 'helpers/urlFormatter';

// Data
import videos from 'data/videos';


class Videos extends Component {

  constructor(props) {
    super(props);
    this.state = {
      redirect: null
    };
  }

  initLanguage() {
    const selectedVideoId = this.props.match && this.props.match.params && this.props.match.params.videoId
      ? this.props.match.params.videoId
      : null;
    this.props.updateMultilingualRoutes(
      selectedVideoId
      ? `videos/${selectedVideoId}/`
      : 'videos/');
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

  renderSummarySnippet(videos) {
    const videoItems = videos.map((video, index) => {
      const selectedLanguageKey = this.props.selectedLanguageKey
        ? this.props.selectedLanguageKey
        : 'no';
      const languageSlug = this.props.getLanguageSlug(selectedLanguageKey);
      const videoId = convertToUrlFriendlyString(video.title[selectedLanguageKey]);
      return {
        "@type": "ListItem",
        "position": index+1,
        "url": `https://www.dehlimusikk.no/${languageSlug}videos/${videoId}/`,
      };
    });
    const snippet = {
      "@context": "http://schema.org",
      "@type": "ItemList",
      "itemListElement": videoItems
    };
    return (<Helmet>
      <script type="application/ld+json">{`${JSON.stringify(snippet)}`}</script>
    </Helmet>);
  }

  renderVideos() {
    return videos && videos.length
      ? videos.map(video => {
        const videoId = convertToUrlFriendlyString(video.title[this.props.selectedLanguageKey]);
        return (<ListItem key={videoId} fullscreen={this.props.fullscreen}>
          <Video video={video}/>
        </ListItem>)
      })
      : '';
  }

  renderSelectedVideo(selectedVideo) {
    const handleClickOutside = () => {
      this.setState({
        redirect: `/${this.props.getLanguageSlug(this.props.selectedLanguageKey)}videos/`
      });
    }
    const handleClickArrowLeft = selectedVideo && selectedVideo.previousVideoId ? () => {
      this.setState({
        redirect: `/${this.props.getLanguageSlug(this.props.selectedLanguageKey)}videos/${selectedVideo.previousVideoId}/`
      });
    } : null;
    const handleClickArrowRight = selectedVideo && selectedVideo.nextVideoId ? () => {
      this.setState({
        redirect: `/${this.props.getLanguageSlug(this.props.selectedLanguageKey)}videos/${selectedVideo.nextVideoId}/`
      });
    } : null;
    return selectedVideo
      ? (<Modal onClickOutside={handleClickOutside} maxWidth="945px" onClickArrowLeft={handleClickArrowLeft} onClickArrowRight={handleClickArrowRight}>
        <Video video={selectedVideo} fullscreen={true}/>
      </Modal>)
      : '';
  }

  getSelectedVideo(selectedVideoId, selectedLanguageKey) {
    let selectedVideo = null;
    videos.forEach((video, index) => {
      const videoId = convertToUrlFriendlyString(video.title[selectedLanguageKey])
      if (videoId === selectedVideoId) {
        selectedVideo = {
          ...video,
          previousVideoId: index > 0 ? convertToUrlFriendlyString(videos[index-1].title[selectedLanguageKey]) : null,
          nextVideoId: index < videos.length-1 ? convertToUrlFriendlyString(videos[index+1].title[selectedLanguageKey]) : null
        }
      }
    });
    return selectedVideo;
  }

  render() {
    const selectedVideoId = this.props.match && this.props.match.params && this.props.match.params.videoId
      ? this.props.match.params.videoId
      : null;
    const selectedVideo = selectedVideoId
      ? this.getSelectedVideo(selectedVideoId, this.props.selectedLanguageKey)
      : null;

    const listPage = {
      title: {
        en: 'Videos | Dehli Musikk',
        no: 'Videoer | Dehli Musikk'
      },
      heading: {
        en: 'Videos',
        no: 'Videoer'
      },
      description: {
        en: 'Videos Dehli Musikk has created or contributed in',
        no: 'Videoer Dehli Musikk har har laget eller bidratt på'
      }
    }

    const detailsPage = {
      title: {
        en: `${selectedVideo
          ? selectedVideo.title.en
          : ''} - Videos | Dehli Musikk`,
        no: `${selectedVideo
          ? selectedVideo.title.no
          : ''} - Videoer | Dehli Musikk`
      },
      heading: {
        en: selectedVideo
          ? selectedVideo.title.en
          : '',
        no: selectedVideo
          ? selectedVideo.title.no
          : ''
      },
      description: {
        en: selectedVideo
          ? selectedVideo.content.en
          : '',
        no: selectedVideo
          ? selectedVideo.content.no
          : ''
      }
    }

    let breadcrumbs = [
      {
        name: listPage.heading[this.props.selectedLanguageKey],
        path: `/${this.props.getLanguageSlug(this.props.selectedLanguageKey)}videos/`
      }
    ];
    if (selectedVideo) {
      breadcrumbs.push({
        name: detailsPage.heading[this.props.selectedLanguageKey],
        path: `/${this.props.getLanguageSlug(this.props.selectedLanguageKey)}videos/${selectedVideoId}/`
      })
    }

    if (this.state.redirect) {
      return <Redirect to={this.state.redirect}/>;
    } else {
      const selectedVideoMultilingualIds = {
        en: selectedVideo
          ? convertToUrlFriendlyString(selectedVideo.title.en)
          : '',
        no: selectedVideo
          ? convertToUrlFriendlyString(selectedVideo.title.no)
          : ''
      };
      const metaTitle = selectedVideo
        ? detailsPage.title[this.props.selectedLanguageKey]
        : listPage.title[this.props.selectedLanguageKey];
      const contentTitle = selectedVideo
        ? detailsPage.heading[this.props.selectedLanguageKey]
        : listPage.heading[this.props.selectedLanguageKey];
      const metaDescription = selectedVideo
        ? detailsPage.description[this.props.selectedLanguageKey]
        : listPage.description[this.props.selectedLanguageKey];
      return (<React.Fragment>
        <Helmet htmlAttributes={{
            lang: this.props.selectedLanguageKey
          }}>
          <title>{metaTitle}</title>
          <meta name='description' content={metaDescription}/>
          <link rel="canonical" href={`https://www.dehlimusikk.no/${this.props.getLanguageSlug(this.props.selectedLanguageKey)}videos/${selectedVideo
              ? selectedVideoId + '/'
              : ''}`}/>
          <link rel="alternate" href={`https://www.dehlimusikk.no/videos/${selectedVideo
              ? selectedVideoMultilingualIds.no + '/'
              : ''}`} hreflang="no"/>
          <link rel="alternate" href={`https://www.dehlimusikk.no/en/videos/${selectedVideo
              ? selectedVideoMultilingualIds.en + '/'
              : ''}`} hreflang="en"/>
          <link rel="alternate" href={`https://www.dehlimusikk.no/videos/${selectedVideo
              ? selectedVideoMultilingualIds.no + '/'
              : ''}`} hreflang="x-default"/>
          <meta property="og:title" content={contentTitle}/>
          <meta property="og:url" content={`https://www.dehlimusikk.no/${this.props.getLanguageSlug(this.props.selectedLanguageKey)}videos/${selectedVideo
              ? selectedVideoId + '/'
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
        <Container blur={selectedVideo !== null}>
          <Breadcrumbs breadcrumbs={breadcrumbs}/>
          <h1>{contentTitle}</h1>
          <p>{
              this.props.selectedLanguageKey === 'en'
                ? 'Videos Dehli Musikk has created or contributed in'
                : 'Videoer Dehli Musikk har har laget eller bidratt på'
            }</p>
        </Container>
        {
          selectedVideo ? this.renderSelectedVideo(selectedVideo) : this.renderSummarySnippet(videos)
        }
        <Container blur={selectedVideo !== null}>
          <List>
            {this.renderVideos()}
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

export default connect(mapStateToProps, mapDispatchToProps)(Videos);
