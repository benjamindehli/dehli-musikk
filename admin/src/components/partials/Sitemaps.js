// Dependencies
import React from 'react';
import { useSelector } from 'react-redux';
import { saveAs } from 'file-saver';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// Selectors
import { getLanguageSlugByKey } from 'reducers/AvailableLanguagesReducer';

// Helpers
import { convertToUrlFriendlyString } from 'helpers/urlFormatter';
import { convertToXmlFriendlyString } from 'helpers/xmlStringFormatter';
import { youTubeTimeToSeconds } from 'helpers/timeFormatter';
import { formatContentAsString } from 'helpers/contentFormatter';

// Data
import posts from 'data/posts';
import videos from 'data/videos';
import products from 'data/products';
import releases from 'data/portfolio';
import equipmentTypes from 'data/equipment';

// Stylesheet
import style from 'components/routes/Dashboard.module.scss';


const Sitemaps = () => {


  // Redux store
  const languageSlug = {
    no: useSelector(state => getLanguageSlugByKey(state, 'no')),
    en: useSelector(state => getLanguageSlugByKey(state, 'en'))
  }

  const renderLocElement = (loc) => {
    return `<loc>https://www.dehlimusikk.no/${loc?.length ? loc : ''}</loc>\n`;
  }

  const renderLastModElement = (timestamp) => {
    const lastMod = new Date(timestamp).toISOString();
    return `<lastmod>${lastMod}</lastmod>\n`;
  }

  const renderUrlElement = (url, timestamp) => {
    return `<url>${renderLocElement(url)}${timestamp ? renderLastModElement(timestamp) : ''}</url>\n`;
  }

  const renderNewsUrlElement = (url, post, languageKey) => {
    const date = new Date(post.timestamp);
    const dateYear = date.getFullYear();
    const dateMonth = date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1;
    const dateDay = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
    const dateString = `${dateYear}-${dateMonth}-${dateDay}`;
    return `  <url>
    <loc>https://www.dehlimusikk.no/${url}</loc>
    <news:news>
      <news:publication><news:name>Dehli Musikk</news:name><news:language>${languageKey}</news:language></news:publication>
      <news:publication_date>${dateString}</news:publication_date>
      <news:title>${convertToXmlFriendlyString(post.title[languageKey])}</news:title>
    </news:news>
  </url>\n`;
  }

  const renderVideoUrlElement = (url, video, languageKey) => {
    const date = new Date(video.timestamp);
    const dateYear = date.getFullYear();
    const dateMonth = date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1;
    const dateDay = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
    const dateString = `${dateYear}-${dateMonth}-${dateDay}`;
    const duration = youTubeTimeToSeconds(video.duration);
    const thumbnailLoc = require(`../../data/videos/thumbnails/web/jpg/${video.thumbnailFilename}_540.jpg`);
    const absoluteThumbnailLoc = `https://www.dehlimusikk.no${thumbnailLoc}`;
    const contentAsString = formatContentAsString(video.content[languageKey]);
    return `  <url>
    <loc>https://www.dehlimusikk.no/${url}</loc>
    <video:video>
      <video:title>${convertToXmlFriendlyString(video.title[languageKey])}</video:title>
      <video:description>${convertToXmlFriendlyString(contentAsString)}</video:description>
      <video:player_loc allow_embed="yes">https://www.youtube.com/watch?v=${video.youTubeId}</video:player_loc>
      <video:thumbnail_loc>${absoluteThumbnailLoc}</video:thumbnail_loc>
      <video:duration>${duration}</video:duration>
      <video:publication_date>${dateString}</video:publication_date>
      <video:uploader info="https://www.youtube.com/${video.youTubeChannelId}">${video.youTubeUser}</video:uploader>
      <video:live>no</video:live>
    </video:video>
  </url>\n`;
  }

  const renderImageUrlElement = (image) => {
    const imageLicense = image.license ? `<image:license>${image.license}</image:license>` : '';
    const imageGeoLocation = image.geoLocation ? `<image:geo_location>${image.geoLocation}</image:geo_location>` : '';
    return `<image:image><image:loc>https://www.dehlimusikk.no${image.loc}</image:loc><image:title>${image.title}</image:title><image:caption>${image.caption}</image:caption>${imageLicense}${imageGeoLocation}</image:image>`;
  }

  const renderImagePageUrlElement = (url, images) => {
    let imageUrlElements = ''
    images.forEach(image => {
      imageUrlElements += renderImageUrlElement(image);
    })
    return `  <url>
    <loc>https://www.dehlimusikk.no/${url}</loc>
    ${imageUrlElements}
  </url>\n`;
  }

  const renderHome = () => {
    const urlNorwegianPage = `${languageSlug.no}`;
    const urlEnglishPage = `${languageSlug.en}`;
    return [renderUrlElement(urlNorwegianPage), renderUrlElement(urlEnglishPage)].join('')
  }

  const renderPostsList = () => {
    const urlNorwegianPage = `${languageSlug.no}posts/`;
    const urlEnglishPage = `${languageSlug.en}posts/`;
    return [renderUrlElement(urlNorwegianPage), renderUrlElement(urlEnglishPage)].join('')
  }

  const renderVideosList = () => {
    const urlNorwegianPage = `${languageSlug.no}videos/`;
    const urlEnglishPage = `${languageSlug.en}videos/`;
    return [renderUrlElement(urlNorwegianPage), renderUrlElement(urlEnglishPage)].join('')
  }

  const renderProductsList = () => {
    const urlNorwegianPage = `${languageSlug.no}products/`;
    const urlEnglishPage = `${languageSlug.en}products/`;
    return [renderUrlElement(urlNorwegianPage), renderUrlElement(urlEnglishPage)].join('')
  }

  const renderReleasesList = () => {
    const urlNorwegianPage = `${languageSlug.no}portfolio/`;
    const urlEnglishPage = `${languageSlug.en}portfolio/`;
    return [renderUrlElement(urlNorwegianPage), renderUrlElement(urlEnglishPage)].join('')
  }

  const renderEquipmentTypesList = () => {
    const urlNorwegianPage = `${languageSlug.no}equipment/`;
    const urlEnglishPage = `${languageSlug.en}equipment/`;

    const equipmentTypeElements = [renderUrlElement(urlNorwegianPage), renderUrlElement(urlEnglishPage)];
    if (equipmentTypes && Object.keys(equipmentTypes).length) {
      Object.keys(equipmentTypes).forEach(equipmentTypeKey => {
        equipmentTypeElements.push(renderUrlElement(`${urlNorwegianPage}${equipmentTypeKey}/`));
        equipmentTypeElements.push(renderUrlElement(`${urlEnglishPage}${equipmentTypeKey}/`));
      })
    }
    return equipmentTypeElements.join('');
  }

  const renderPostsDetails = () => {
    return posts && posts.length
      ? posts.map(post => {
        const urlNorwegianPage = `${languageSlug.no}posts/${convertToUrlFriendlyString(post.title.no)}/`;
        const urlEnglishPage = `${languageSlug.en}posts/${convertToUrlFriendlyString(post.title.en)}/`;
        const timestamp = !!post?.lastmod ? post.lastmod : post?.timestamp;
        return [renderUrlElement(urlNorwegianPage, timestamp), renderUrlElement(urlEnglishPage, timestamp)].join('')
      }).join('')
      : '';
  }

  const renderVideosDetails = () => {
    return videos && videos.length
      ? videos.map(video => {
        const urlNorwegianPage = `${languageSlug.no}videos/${convertToUrlFriendlyString(video.title.no)}/`;
        const urlEnglishPage = `${languageSlug.en}videos/${convertToUrlFriendlyString(video.title.en)}/`;
        const timestamp = !!video?.lastmod ? video.lastmod : video?.timestamp;
        return [renderUrlElement(urlNorwegianPage, timestamp), renderUrlElement(urlEnglishPage, timestamp)].join('')
      }).join('')
      : '';
  }

  const renderVideosDetailsVideo = () => {
    return videos && videos.length
      ? videos.map(video => {
        const urlNorwegianPage = `${languageSlug.no}videos/${convertToUrlFriendlyString(video.title.no)}/video/`;
        const urlEnglishPage = `${languageSlug.en}videos/${convertToUrlFriendlyString(video.title.en)}/video/`;
        const timestamp = !!video?.lastmod ? video.lastmod : video?.timestamp;
        return [renderUrlElement(urlNorwegianPage, timestamp), renderUrlElement(urlEnglishPage, timestamp)].join('')
      }).join('')
      : '';
  }

  const renderProductsDetails = () => {
    return products && products.length
      ? products.map(product => {
        const urlNorwegianPage = `${languageSlug.no}products/${convertToUrlFriendlyString(product.title)}/`;
        const urlEnglishPage = `${languageSlug.en}products/${convertToUrlFriendlyString(product.title)}/`;
        const timestamp = !!product?.lastmod ? product.lastmod : product?.timestamp;
        return [renderUrlElement(urlNorwegianPage, timestamp), renderUrlElement(urlEnglishPage, timestamp)].join('')
      }).join('')
      : '';
  }

  const renderReleasesDetails = () => {
    return releases && releases.length
      ? releases.map(release => {
        const relaseId = `${release.artistName} ${release.title}`;
        const urlNorwegianPage = `${languageSlug.no}portfolio/${convertToUrlFriendlyString(relaseId)}/`;
        const urlEnglishPage = `${languageSlug.en}portfolio/${convertToUrlFriendlyString(relaseId)}/`;
        const timestamp = !!release?.lastmod ? release.lastmod : release?.releaseDate;
        return [renderUrlElement(urlNorwegianPage, timestamp), renderUrlElement(urlEnglishPage, timestamp)].join('')
      }).join('')
      : '';
  }

  const renderEquipmentDetails = () => {
    const urlNorwegianPage = `${languageSlug.no}equipment/`;
    const urlEnglishPage = `${languageSlug.en}equipment/`;

    const equipmentDetailsElements = [];
    if (equipmentTypes && Object.keys(equipmentTypes).length) {
      Object.keys(equipmentTypes).forEach(equipmentTypeKey => {
        const equipmentItems = equipmentTypes[equipmentTypeKey].items;
        equipmentItems.forEach(item => {
          const itemId = `${item.brand} ${item.model}`;
          equipmentDetailsElements.push(renderUrlElement(`${urlNorwegianPage}${equipmentTypeKey}/${convertToUrlFriendlyString(itemId)}/`));
          equipmentDetailsElements.push(renderUrlElement(`${urlEnglishPage}${equipmentTypeKey}/${convertToUrlFriendlyString(itemId)}/`));
        })
      })
    }
    return equipmentDetailsElements.join('');
  }

  const getImagesFromPost = (post, languageKey) => {
    let images = [];
    const formats = ['avif', 'webp', 'jpg'];
    const sizes = [55, 350, 540];
    formats.forEach(format => {
      const imagePath = `data/posts/thumbnails/web/${format}/${post.thumbnailFilename}`;
      sizes.forEach(size => {
        const imageLoc = require(`../../${imagePath}_${size}.${format}`);
        let image = {
          loc: imageLoc,
          caption: convertToXmlFriendlyString(post.thumbnailDescription),
          title: convertToXmlFriendlyString(post.title[languageKey])
        };
        if (post.copyright) {
          image.license = 'https://creativecommons.org/licenses/by-sa/4.0/';
          image.geoLocation = 'Bø i Telemark, Norway';
        }
        images.push(image);
      })
    });
    return images;
  }

  const getImagesFromVideo = (video, languageKey) => {
    let images = [];
    const formats = ['avif', 'webp', 'jpg'];
    const sizes = [55, 350, 540];
    formats.forEach(format => {
      const imagePath = `data/videos/thumbnails/web/${format}/${video.thumbnailFilename}`;
      sizes.forEach(size => {
        const imageLoc = require(`../../${imagePath}_${size}.${format}`);
        let image = {
          loc: imageLoc,
          caption: convertToXmlFriendlyString(video.thumbnailDescription),
          title: convertToXmlFriendlyString(video.title[languageKey])
        };
        if (video.copyright) {
          image.license = 'https://creativecommons.org/licenses/by-sa/4.0/';
          image.geoLocation = 'Bø i Telemark, Norway';
        }
        images.push(image);
      })
    });
    return images;
  }

  const getImagesFromProduct = (product) => {
    let images = [];
    const formats = ['avif', 'webp', 'jpg'];
    const sizes = [55, 350, 540];
    formats.forEach(format => {
      const imagePath = `data/products/thumbnails/web/${format}/${convertToUrlFriendlyString(product.title)}`;
      sizes.forEach(size => {
        const imageLoc = require(`../../${imagePath}_${size}.${format}`);
        let image = {
          loc: imageLoc,
          caption: convertToXmlFriendlyString(product.thumbnailDescription),
          title: convertToXmlFriendlyString(product.title),
          license: 'https://creativecommons.org/licenses/by-sa/4.0/',
          geoLocation: 'Bø i Telemark, Norway'
        };
        images.push(image);
      })
    });
    return images;
  }

  const getImagesFromEquipmentType = (equipmentType, languageKey) => {
    let images = [];
    const formats = ['avif', 'webp', 'jpg'];
    const sizes = [55, 350, 540, 945];

    formats.forEach(format => {
      const imagePath = `data/equipment/thumbnails/web/${format}/${equipmentType.equipmentType}`;
      sizes.forEach(size => {
        const imageLoc = require(`../../${imagePath}_${size}.${format}`);
        let image = {
          loc: imageLoc,
          caption: convertToXmlFriendlyString(equipmentType.name[languageKey]),
          title: convertToXmlFriendlyString(equipmentType.name[languageKey]),
          license: 'https://creativecommons.org/licenses/by-sa/4.0/',
          geoLocation: 'Bø i Telemark, Norway'
        };
        images.push(image);
      })
    });
    return images;
  }

  const getImagesFromEquipmentItem = (equipmentItem, equipmentType) => {
    let images = [];
    const formats = ['avif', 'webp', 'jpg'];
    const sizes = [55, 350, 540, 945];

    const imageFileName = convertToUrlFriendlyString(`${equipmentItem.brand} ${equipmentItem.model}`);
    formats.forEach(format => {
      const imagePath = `data/equipment/thumbnails/${equipmentType}/web/${format}/${imageFileName}`;
      sizes.forEach(size => {
        const imageLoc = require(`../../${imagePath}_${size}.${format}`);
        let image = {
          loc: imageLoc,
          caption: convertToXmlFriendlyString(`${equipmentItem.model} by ${equipmentItem.brand}`),
          title: convertToXmlFriendlyString(`${equipmentItem.brand} ${equipmentItem.model}`),
          license: 'https://creativecommons.org/licenses/by-sa/4.0/',
          geoLocation: 'Bø i Telemark, Norway'
        };
        images.push(image);
      })
    });
    return images;
  }

  const renderPostsListImages = () => {
    const urlNorwegianPage = `${languageSlug.no}posts/`;
    const urlEnglishPage = `${languageSlug.en}posts/`;
    let norwegianImages = [];
    let englishImages = [];
    if (posts && posts.length) {
      posts.forEach(post => {
        norwegianImages = norwegianImages.concat(getImagesFromPost(post, 'no'));
        englishImages = englishImages.concat(getImagesFromPost(post, 'en'));
      })
    }
    return [renderImagePageUrlElement(urlNorwegianPage, norwegianImages), renderImagePageUrlElement(urlEnglishPage, englishImages)].join('')
  }

  const renderVideosListImages = () => {
    const urlNorwegianPage = `${languageSlug.no}videos/`;
    const urlEnglishPage = `${languageSlug.en}videos/`;
    let norwegianImages = [];
    let englishImages = [];
    if (videos && videos.length) {
      videos.forEach(video => {
        norwegianImages = norwegianImages.concat(getImagesFromVideo(video, 'no'));
        englishImages = englishImages.concat(getImagesFromVideo(video, 'en'));
      })
    }
    return [renderImagePageUrlElement(urlNorwegianPage, norwegianImages), renderImagePageUrlElement(urlEnglishPage, englishImages)].join('')
  }

  const renderProductsListImages = () => {
    const urlNorwegianPage = `${languageSlug.no}products/`;
    const urlEnglishPage = `${languageSlug.en}products/`;
    let norwegianImages = [];
    let englishImages = [];
    if (products && products.length) {
      products.forEach(product => {
        norwegianImages = norwegianImages.concat(getImagesFromProduct(product));
        englishImages = englishImages.concat(getImagesFromProduct(product));
      })
    }
    return [renderImagePageUrlElement(urlNorwegianPage, norwegianImages), renderImagePageUrlElement(urlEnglishPage, englishImages)].join('')
  }

  const renderEquipmentTypesListImages = () => {
    const urlNorwegianPage = `${languageSlug.no}equipment/`;
    const urlEnglishPage = `${languageSlug.en}equipment/`;
    let norwegianImages = [];
    let englishImages = [];
    if (equipmentTypes && Object.keys(equipmentTypes).length) {
      Object.keys(equipmentTypes).forEach(equipmentTypeKey => {
        const equipmentType = equipmentTypes[equipmentTypeKey];
        norwegianImages = norwegianImages.concat(getImagesFromEquipmentType(equipmentType, 'no'));
        englishImages = englishImages.concat(getImagesFromEquipmentType(equipmentType, 'en'));
      })
    }
    return [renderImagePageUrlElement(urlNorwegianPage, norwegianImages), renderImagePageUrlElement(urlEnglishPage, englishImages)].join('')
  }

  const renderEquipmentListImages = () => {
    const urlNorwegianPage = `${languageSlug.no}equipment/`;
    const urlEnglishPage = `${languageSlug.en}equipment/`;
    const equipmentDetailsElements = [];
    if (equipmentTypes && Object.keys(equipmentTypes).length) {
      Object.keys(equipmentTypes).forEach(equipmentTypeKey => {
        const equipmentItems = equipmentTypes[equipmentTypeKey].items;
        const urlNorwegianItemListPage = `${urlNorwegianPage}${equipmentTypeKey}/`;
        const urlEnglishItemListPage = `${urlEnglishPage}${equipmentTypeKey}/`;
        let images = [];
        equipmentItems.forEach(item => {
          images = images.concat(getImagesFromEquipmentItem(item, equipmentTypeKey));
        });
        equipmentDetailsElements.push(renderImagePageUrlElement(urlNorwegianItemListPage, images));
        equipmentDetailsElements.push(renderImagePageUrlElement(urlEnglishItemListPage, images));
      })
    }
    return equipmentDetailsElements.join('');
  }

  const renderPostsDetailsImages = () => {
    return posts && posts.length
      ? posts.map(post => {
        const norwegianImages = getImagesFromPost(post, 'no');
        const englishImages = getImagesFromPost(post, 'en');
        const urlNorwegianPage = `${languageSlug.no}posts/${convertToUrlFriendlyString(post.title.no)}/`;
        const urlEnglishPage = `${languageSlug.en}posts/${convertToUrlFriendlyString(post.title.en)}/`;
        return [renderImagePageUrlElement(urlNorwegianPage, norwegianImages), renderImagePageUrlElement(urlEnglishPage, englishImages)].join('')
      }).join('')
      : '';
  }

  const renderProductsDetailsImages = () => {
    return products && products.length
      ? products.map(product => {
        const norwegianImages = getImagesFromProduct(product);
        const englishImages = getImagesFromProduct(product);
        const urlNorwegianPage = `${languageSlug.no}products/${convertToUrlFriendlyString(product.title)}/`;
        const urlEnglishPage = `${languageSlug.en}products/${convertToUrlFriendlyString(product.title)}/`;
        return [renderImagePageUrlElement(urlNorwegianPage, norwegianImages), renderImagePageUrlElement(urlEnglishPage, englishImages)].join('')
      }).join('')
      : '';
  }

  const renderEquipmentDetailsImages = () => {
    const urlNorwegianPage = `${languageSlug.no}equipment/`;
    const urlEnglishPage = `${languageSlug.en}equipment/`;

    const equipmentDetailsElements = [];
    if (equipmentTypes && Object.keys(equipmentTypes).length) {
      Object.keys(equipmentTypes).forEach(equipmentTypeKey => {
        const equipmentItems = equipmentTypes[equipmentTypeKey].items;
        equipmentItems.forEach(item => {
          const itemId = convertToUrlFriendlyString(`${item.brand} ${item.model}`);
          const urlNorwegianItemPage = `${urlNorwegianPage}${equipmentTypeKey}/${itemId}/`;
          const urlEnglishItemPage = `${urlEnglishPage}${equipmentTypeKey}/${itemId}/`;
          const images = getImagesFromEquipmentItem(item, equipmentTypeKey);
          equipmentDetailsElements.push(renderImagePageUrlElement(urlNorwegianItemPage, images));
          equipmentDetailsElements.push(renderImagePageUrlElement(urlEnglishItemPage, images));
        })
      })
    }
    return equipmentDetailsElements.join('');
  }

  const renderNewsPostsDetails = () => {
    return posts && posts.length
      ? posts.map(post => {
        const urlNorwegianPage = `${languageSlug.no}posts/${convertToUrlFriendlyString(post.title.no)}/`;
        const urlEnglishPage = `${languageSlug.en}posts/${convertToUrlFriendlyString(post.title.en)}/`;
        return [renderNewsUrlElement(urlNorwegianPage, post, 'no'), renderNewsUrlElement(urlEnglishPage, post, 'en')].join('')
      }).join('')
      : '';
  }

  const renderVideoSitemapDetails = () => {
    return videos && videos.length
      ? videos.map(video => {
        const urlNorwegianPage = `${languageSlug.no}videos/${convertToUrlFriendlyString(video.title.no)}/video/`;
        const urlEnglishPage = `${languageSlug.en}videos/${convertToUrlFriendlyString(video.title.en)}/video/`;
        return [renderVideoUrlElement(urlNorwegianPage, video, 'no'), renderVideoUrlElement(urlEnglishPage, video, 'en')].join('')
      }).join('')
      : '';
  }


  const getSitemapXML = () => {
    return [
      '<?xml version="1.0" encoding="UTF-8"?>\n',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n',
      renderHome(),
      renderPostsList(),
      renderVideosList(),
      renderProductsList(),
      renderReleasesList(),
      renderEquipmentTypesList(),
      renderPostsDetails(),
      renderVideosDetails(),
      renderVideosDetailsVideo(),
      renderProductsDetails(),
      renderReleasesDetails(),
      renderEquipmentDetails(),
      '</urlset>'
    ].join('');
  }

  const getNewsSitemapXML = () => {
    return [
      '<?xml version="1.0" encoding="UTF-8"?>\n',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">\n',
      renderNewsPostsDetails(),
      '</urlset>'
    ].join('');
  }

  const getImageSitemapXML = () => {
    return [
      '<?xml version="1.0" encoding="UTF-8"?>\n',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n',
      renderPostsListImages(),
      renderPostsDetailsImages(),
      renderVideosListImages(),
      renderEquipmentTypesListImages(),
      renderEquipmentListImages(),
      renderEquipmentDetailsImages(),
      renderProductsListImages(),
      renderProductsDetailsImages(),
      '</urlset>'
    ].join('');
  }

  const getVideoSitemapXML = () => {
    return [
      '<?xml version="1.0" encoding="UTF-8"?>\n',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">\n',
      renderVideoSitemapDetails(),
      '</urlset>'
    ].join('');
  }

  const saveFileContent = (fileContent, fileName) => {
    const blob = new Blob([fileContent], {
      type: "application/xml;charset=utf-8"
    });
    saveAs(blob, fileName);
  }


  return (
    <div className={style.grid}>
      <button className={style.gridItem} onClick={() => saveFileContent(getSitemapXML(), 'sitemap.xml')}>
        <span className={style.gridItemIcon}>
          <FontAwesomeIcon icon={['fas', 'music']} size="3x" />
          <span className={style.gridItemIconBadge}>
            <FontAwesomeIcon icon={['fas', 'download']} />
          </span>
        </span>
        <span className={style.gridItemName}>sitemap.xml</span>
      </button>
      <button className={style.gridItem} onClick={() => saveFileContent(getNewsSitemapXML(), 'news-sitemap.xml')}>
        <span className={style.gridItemIcon}>
          <FontAwesomeIcon icon={['fas', 'music']} size="3x" />
          <span className={style.gridItemIconBadge}>
            <FontAwesomeIcon icon={['fas', 'download']} />
          </span>
        </span>
        <span className={style.gridItemName}>news-sitemap.xml</span>
      </button>
      <button className={style.gridItem} onClick={() => saveFileContent(getImageSitemapXML(), 'image-sitemap.xml')}>
        <span className={style.gridItemIcon}>
          <FontAwesomeIcon icon={['fas', 'music']} size="3x" />
          <span className={style.gridItemIconBadge}>
            <FontAwesomeIcon icon={['fas', 'download']} />
          </span>
        </span>
        <span className={style.gridItemName}>image-sitemap.xml</span>
      </button>
      <button className={style.gridItem} onClick={() => saveFileContent(getVideoSitemapXML(), 'video-sitemap.xml')}>
        <span className={style.gridItemIcon}>
          <FontAwesomeIcon icon={['fas', 'music']} size="3x" />
          <span className={style.gridItemIconBadge}>
            <FontAwesomeIcon icon={['fas', 'download']} />
          </span>
        </span>
        <span className={style.gridItemName}>video-sitemap.xml</span>
      </button>
    </div>)
}


export default Sitemaps;
