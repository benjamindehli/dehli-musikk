// Dependencies
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router';
import { Helmet } from 'react-helmet-async';

// Components
import Breadcrumbs from 'components/partials/Breadcrumbs';
import Container from 'components/template/Container';
import List from 'components/template/List';
import ListItem from 'components/template/List/ListItem';
import Modal from 'components/template/Modal';
import Video from 'components/partials/Video';

// Actions
import { updateSelectedLanguageKey } from 'actions/LanguageActions';

// Selectors
import { getLanguageSlug } from 'reducers/AvailableLanguagesReducer';

// Helpers
import { convertToUrlFriendlyString } from 'helpers/urlFormatter';

// Data
import videos from 'data/videos';


const Videos = () => {


  const dispatch = useDispatch();
  const navigate = useNavigate();
  const params = useParams();
  const selectedVideoId = params?.videoId || null

  // Redux store
  const selectedLanguageKey = useSelector(state => state.selectedLanguageKey)
  const languageSlug = useSelector(state => getLanguageSlug(state));

  useEffect(() => {
    if (params.selectedLanguage) {
      dispatch(updateSelectedLanguageKey(params.selectedLanguage))
    }
  }, [dispatch, params])


  const renderSummarySnippet = (videos) => {

    const videoItems = videos.map((video, index) => {
      const videoId = convertToUrlFriendlyString(video.title[selectedLanguageKey]);
      const imagePathJpg = `data/videos/thumbnails/web/jpg/${video.thumbnailFilename}`;
      const videoThumbnailSrc = require(`../../${imagePathJpg}_540.jpg`)
      const videoDate = new Date(video.timestamp).toISOString();


      return {
        "@type": "VideoObject",
        "@id": `https://www.dehlimusikk.no/${languageSlug}videos/${videoId}/`,
        "position": index + 1,
        "url": `https://www.dehlimusikk.no/${languageSlug}videos/${videoId}/`,
        "name": video.title[selectedLanguageKey],
        "description": video.content[selectedLanguageKey]
          ? video.content[selectedLanguageKey].replace(/\n/g, " ")
          : '',
        "thumbnailUrl": `https://www.dehlimusikk.no${videoThumbnailSrc}`,
        "embedURL": `https://www.youtube.com/watch?v=${video.youTubeId}`,
        "uploadDate": videoDate
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

  const renderVideos = () => {
    return videos && videos.length
      ? videos.map(video => {
        const videoId = convertToUrlFriendlyString(video.title[selectedLanguageKey]);
        return (<ListItem key={videoId}>
          <Video video={video} />
        </ListItem>)
      })
      : '';
  }

  const renderSelectedVideo = (selectedVideo) => {
    const handleClickOutside = () => {
      navigate(`/${languageSlug}videos/`);
    };
    const arrowLeftLink = selectedVideo && selectedVideo.previousVideoId
      ? `/${languageSlug}videos/${selectedVideo.previousVideoId}/`
      : null;
    const arrowRightLink = selectedVideo && selectedVideo.nextVideoId
      ? `/${languageSlug}videos/${selectedVideo.nextVideoId}/`
      : null;
    return selectedVideo
      ? (
        <Modal
          onClickOutside={handleClickOutside}
          maxWidth="945px"
          arrowLeftLink={arrowLeftLink}
          arrowRightLink={arrowRightLink}
          selectedLanguageKey={selectedLanguageKey}>
          <Video video={selectedVideo} fullscreen={true} />
        </Modal>
      )
      : '';
  }

  const getSelectedVideo = (selectedVideoId, selectedLanguageKey) => {
    let selectedVideo = null;
    videos.forEach((video, index) => {
      const videoId = convertToUrlFriendlyString(video.title[selectedLanguageKey])
      if (videoId === selectedVideoId) {
        selectedVideo = {
          ...video,
          previousVideoId: index > 0 ? convertToUrlFriendlyString(videos[index - 1].title[selectedLanguageKey]) : null,
          nextVideoId: index < videos.length - 1 ? convertToUrlFriendlyString(videos[index + 1].title[selectedLanguageKey]) : null
        }
      }
    });
    return selectedVideo;
  }

  const selectedVideo = selectedVideoId
    ? getSelectedVideo(selectedVideoId, selectedLanguageKey)
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
      name: listPage.heading[selectedLanguageKey],
      path: `/${languageSlug}videos/`
    }
  ];
  if (selectedVideo) {
    breadcrumbs.push({
      name: detailsPage.heading[selectedLanguageKey],
      path: `/${languageSlug}videos/${selectedVideoId}/`
    })
  }


  const selectedVideoMultilingualIds = {
    en: selectedVideo
      ? convertToUrlFriendlyString(selectedVideo.title.en)
      : '',
    no: selectedVideo
      ? convertToUrlFriendlyString(selectedVideo.title.no)
      : ''
  };
  const metaTitle = selectedVideo
    ? detailsPage.title[selectedLanguageKey]
    : listPage.title[selectedLanguageKey];
  const contentTitle = selectedVideo
    ? detailsPage.heading[selectedLanguageKey]
    : listPage.heading[selectedLanguageKey];
  const metaDescription = selectedVideo
    ? detailsPage.description[selectedLanguageKey]
    : listPage.description[selectedLanguageKey];
  return (<React.Fragment>
    <Helmet htmlAttributes={{
      lang: selectedLanguageKey
    }}>
      <title>{metaTitle}</title>
      <meta name='description' content={metaDescription} />
      <link rel="canonical" href={`https://www.dehlimusikk.no/${languageSlug}videos/${selectedVideo
        ? selectedVideoId + '/'
        : ''}`} />
      <link rel="alternate" href={`https://www.dehlimusikk.no/videos/${selectedVideo
        ? selectedVideoMultilingualIds.no + '/'
        : ''}`} hreflang="no" />
      <link rel="alternate" href={`https://www.dehlimusikk.no/en/videos/${selectedVideo
        ? selectedVideoMultilingualIds.en + '/'
        : ''}`} hreflang="en" />
      <link rel="alternate" href={`https://www.dehlimusikk.no/videos/${selectedVideo
        ? selectedVideoMultilingualIds.no + '/'
        : ''}`} hreflang="x-default" />
      <meta property="og:title" content={contentTitle} />
      <meta property="og:url" content={`https://www.dehlimusikk.no/${languageSlug}videos/${selectedVideo
        ? selectedVideoId + '/'
        : ''}`} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:locale" content={selectedLanguageKey === 'en'
        ? 'en_US'
        : 'no_NO'} />
      <meta property="og:locale:alternate" content={selectedLanguageKey === 'en'
        ? 'nb_NO'
        : 'en_US'} />
      <meta property="twitter:title" content={contentTitle} />
      <meta property="twitter:description" content={metaDescription} />
    </Helmet>
    <Container blur={selectedVideo !== null}>
      <Breadcrumbs breadcrumbs={breadcrumbs} />
      <h1>{contentTitle}</h1>
      <p>{
        selectedLanguageKey === 'en'
          ? 'Videos Dehli Musikk has created or contributed in'
          : 'Videoer Dehli Musikk har har laget eller bidratt på'
      }</p>
    </Container>
    {
      selectedVideo ? renderSelectedVideo(selectedVideo) : renderSummarySnippet(videos)
    }
    <Container blur={selectedVideo !== null}>
      <List>
        {renderVideos()}
      </List>
    </Container>
  </React.Fragment>)
}

export default Videos;
