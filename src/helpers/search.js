// Helpers
import { convertToUrlFriendlyString } from 'helpers/urlFormatter';
import { formatContentAsString } from './contentFormatter';

// Data
import releases from 'data/portfolio';
import posts from 'data/posts';
import videos from 'data/videos';
import products from 'data/products';
import equipmentTypes from 'data/equipment';
import frequentlyAskedQuestions from 'data/frequentlyAskedQuestions';

const getLanguageSlug = selectedLanguageKey => {
  return selectedLanguageKey === 'en' ? 'en/' : '';
};

export const convertStringToExcerpt = string => {
  if (!string?.trim().length) {
    return ''
  }
  string = formatContentAsString(string);
  string = string.replace(/[\s]+/g, " ");
  const trimmedString = string.length > 158 ? `${string.substring(0, 158)}...` : string;
  return trimmedString;
}


// Get search point
const getSearchPointsFromRelease = (release, searchStringWords, selectedLanguageKey) => {
  const id = convertToUrlFriendlyString(`${release.artistName} ${release.title}`);
  const link = `/${getLanguageSlug(selectedLanguageKey)}portfolio/${id}/`;
  const linkTitle = `${selectedLanguageKey === 'en' ? 'Listen to' : 'Lytt til'} ${release.title}`;

  let artistNamePoints = 0;
  let titlePoints = 0;
  let genrePoints = 0;

  searchStringWords.forEach(searchStringWord => {
    const regex = new RegExp(searchStringWord, "gi");

    const artistNameMatch = release.artistName.match(regex);
    const titleMatch = release.title.match(regex);
    const genreMatch = release.genre.match(regex);

    artistNamePoints += artistNameMatch ? artistNameMatch.length * 15 : 0;
    titlePoints += titleMatch ? titleMatch.length * 15 : 0;
    genrePoints += genreMatch ? genreMatch.length * 5 : 0;
  });

  const points = (artistNamePoints + titlePoints + genrePoints) / searchStringWords.length;

  const thumbnailPaths = !release.unreleased
    ? {
      avif: require(`../data/releases/thumbnails/web/avif/${release.thumbnailFilename}_55.avif`),
      webp: require(`../data/releases/thumbnails/web/webp/${release.thumbnailFilename}_55.webp`),
      jpg: require(`../data/releases/thumbnails/web/jpg/${release.thumbnailFilename}_55.jpg`)
    }
    : {
      avif: require(`../assets/images/comingSoon_${selectedLanguageKey}_55.avif`),
      webp: require(`../assets/images/comingSoon_${selectedLanguageKey}_55.webp`),
      png: require(`../assets/images/comingSoon_${selectedLanguageKey}_55.png`)
    };
  const thumbnailDescription = selectedLanguageKey === 'en' ? `Cover image for ${release.title} by ${release.artistName}` : `Coverbilde til ${release.title} av ${release.artistName}`;

  const durationString = `${new Date(release.duration).getMinutes()}:${new Date(release.duration).getSeconds() > 9
    ? new Date(release.duration).getSeconds()
    : '0' + new Date(release.duration).getSeconds()
    }`;

  const releaseYearString = `${new Date(release.releaseDate).getFullYear()}`

  const excerpt = `${selectedLanguageKey === 'en' ? 'Released' : 'Utgitt'}: ${releaseYearString}, ${selectedLanguageKey === 'en' ? 'duration' : 'lengde'}: ${durationString}, ${selectedLanguageKey === 'en' ? 'genre' : 'sjanger'}: ${release.genre}`;

  return {
    type: 'release',
    text: `${release.artistName} - ${release.title} (${release.genre})`,
    label: selectedLanguageKey === 'en' ? 'Releases' : 'Utgivelser',
    excerpt,
    thumbnailPaths,
    thumbnailDescription,
    points,
    link,
    linkTitle
  }
}

const getSearchPointsFromPost = (post, searchStringWords, selectedLanguageKey) => {
  if (!post){
    return null;
  }

  const id = convertToUrlFriendlyString(post.title[selectedLanguageKey]);
  const link = `/${getLanguageSlug(selectedLanguageKey)}posts/${id}/`;
  const linkTitle = post.title[selectedLanguageKey];

  let titlePoints = 0;
  let contentPoints = 0;

  searchStringWords.forEach(searchStringWord => {
    const regex = new RegExp(searchStringWord, "gi");

    const titleMatch = post.title[selectedLanguageKey]?.match(regex);
    const contentMatch = post.content[selectedLanguageKey]?.match(regex);

    titlePoints += titleMatch ? titleMatch.length * 5 : 0;
    contentPoints += contentMatch ? contentMatch.length : 0;
  });

  const points = (titlePoints + contentPoints) / searchStringWords.length;

  const thumbnailPaths = {
    avif: require(`../data/posts/thumbnails/web/avif/${post.thumbnailFilename}_55.avif`),
    webp: require(`../data/posts/thumbnails/web/webp/${post.thumbnailFilename}_55.webp`),
    jpg: require(`../data/posts/thumbnails/web/jpg/${post.thumbnailFilename}_55.jpg`)
  };
  const thumbnailDescription = post.thumbnailDescription;

  return {
    type: 'post',
    text: post.title[selectedLanguageKey],
    label: selectedLanguageKey === 'en' ? 'Posts' : 'Innlegg',
    excerpt: convertStringToExcerpt(post.content[selectedLanguageKey]),
    thumbnailPaths,
    thumbnailDescription,
    points,
    link,
    linkTitle
  }
}

const getSearchPointsFromVideos = (video, searchStringWords, selectedLanguageKey) => {
  const id = convertToUrlFriendlyString(video.title[selectedLanguageKey]);
  const link = `/${getLanguageSlug(selectedLanguageKey)}videos/${id}/`;
  const linkTitle = video.title[selectedLanguageKey];

  let titlePoints = 0;
  let contentPoints = 0;

  searchStringWords.forEach(searchStringWord => {
    const regex = new RegExp(searchStringWord, "gi");

    const titleMatch = video.title[selectedLanguageKey]?.match(regex);
    const contentMatch = video.content[selectedLanguageKey]?.match(regex);

    titlePoints += titleMatch ? titleMatch.length * 5 : 0;
    contentPoints += contentMatch ? contentMatch.length : 0;
  });

  const points = (titlePoints + contentPoints) / searchStringWords.length;

  const thumbnailPaths = {
    avif: require(`../data/videos/thumbnails/web/avif/${video.thumbnailFilename}_55.avif`),
    webp: require(`../data/videos/thumbnails/web/webp/${video.thumbnailFilename}_55.webp`),
    jpg: require(`../data/videos/thumbnails/web/jpg/${video.thumbnailFilename}_55.jpg`)
  };
  const thumbnailDescription = video.thumbnailDescription;

  return {
    type: 'video',
    text: video.title[selectedLanguageKey],
    label: selectedLanguageKey === 'en' ? 'Videos' : 'Videoer',
    excerpt: convertStringToExcerpt(video.content[selectedLanguageKey]),
    thumbnailPaths,
    thumbnailDescription,
    points,
    link,
    linkTitle
  }
}

const getSearchPointsFromProduct = (product, searchStringWords, selectedLanguageKey) => {
  const id = convertToUrlFriendlyString(product.title);
  const link = `/${getLanguageSlug(selectedLanguageKey)}products/${id}/`;
  const linkTitle = product.title;

  let titlePoints = 0;
  let contentPoints = 0;

  searchStringWords.forEach(searchStringWord => {
    const regex = new RegExp(searchStringWord, "gi");

    const titleMatch = product.title.match(regex);
    const contentMatch = product.content[selectedLanguageKey]?.match(regex);

    titlePoints += titleMatch ? titleMatch.length * 10 : 0;
    contentPoints += contentMatch ? contentMatch.length * 2 : 0;
  });

  const points = (titlePoints + contentPoints) / searchStringWords.length;

  const thumbnailPaths = {
    avif: require(`../data/products/thumbnails/web/avif/${id}_55.avif`),
    webp: require(`../data/products/thumbnails/web/webp/${id}_55.webp`),
    jpg: require(`../data/products/thumbnails/web/jpg/${id}_55.jpg`)
  };
  const thumbnailDescription = linkTitle;

  return {
    type: 'product',
    text: product.title,
    label: selectedLanguageKey === 'en' ? 'Products' : 'Produkter',
    excerpt: convertStringToExcerpt(product.content[selectedLanguageKey]),
    thumbnailPaths,
    thumbnailDescription,
    points,
    link,
    linkTitle
  }
}

const getSearchPointsFromEquipmentItems = (item, equipmentType, equipmentTypeKey, searchStringWords, selectedLanguageKey) => {
  const id = convertToUrlFriendlyString(`${item.brand} ${item.model}`);
  const link = `/${getLanguageSlug(selectedLanguageKey)}equipment/${equipmentTypeKey}/${id}/`;
  const linkTitle = `${item.brand} ${item.model}`;

  let brandPoints = 0;
  let modelPoints = 0;
  let equipmentTypePoints = 0;

  searchStringWords.forEach(searchStringWord => {
    const regex = new RegExp(searchStringWord, "gi");

    const brandMatch = item.brand.match(regex);
    const modelMatch = item.model.match(regex);
    const equipmentTypeMatch = equipmentType.name[selectedLanguageKey]?.match(regex);

    brandPoints += brandMatch ? brandMatch.length * 7 : 0;
    modelPoints += modelMatch ? modelMatch.length * 7 : 0;
    equipmentTypePoints += equipmentTypeMatch ? equipmentTypeMatch.length * 1 : 0;
  });

  const points = (brandPoints + modelPoints + equipmentTypePoints) / searchStringWords.length;

  const thumbnailPaths = {
    avif: require(`../data/equipment/thumbnails/${equipmentTypeKey}/web/avif/${id}_55.avif`),
    webp: require(`../data/equipment/thumbnails/${equipmentTypeKey}/web/webp/${id}_55.webp`),
    jpg: require(`../data/equipment/thumbnails/${equipmentTypeKey}/web/jpg/${id}_55.jpg`)
  };
  const thumbnailDescription = `${item.brand} ${item.model}`;

  return {
    type: equipmentTypeKey,
    text: `${item.brand} ${item.model}`,
    label: equipmentType.name[selectedLanguageKey],
    thumbnailPaths,
    thumbnailDescription,
    points,
    link,
    linkTitle
  };
}

const getSearchPointsFromFrequentlyAskedQuestions = (faq, searchStringWords, selectedLanguageKey) => {
  const question = faq.question[selectedLanguageKey];
  const answer = faq.answer[selectedLanguageKey];
  const link = `/${getLanguageSlug(selectedLanguageKey)}frequently-asked-questions/`;
  const hash = convertToUrlFriendlyString(question);
  const linkTitle = question;

  let questionPoints = 0;
  let answerPoints = 0;
  searchStringWords.forEach(searchStringWord => {
    const regex = new RegExp(searchStringWord, "gi");

    const questionMatch = question.match(regex);
    const answerMatch = answer.match(regex);

    questionPoints += questionMatch ? questionMatch.length * 5 : 0;
    answerPoints += answerMatch ? answerMatch.length * 2 : 0;
  });
  const points = (questionPoints + answerPoints) / searchStringWords.length;

  
  const thumbnailPaths = {
    avif: require(`../data/frequentlyAskedQuestions/thumbnails/web/avif/thumbnail_55.avif`),
    webp: require(`../data/frequentlyAskedQuestions/thumbnails/web/webp/thumbnail_55.webp`),
    jpg: require(`../data/frequentlyAskedQuestions/thumbnails/web/jpg/thumbnail_55.jpg`)
  };
  const thumbnailDescription = `Speach bubble icon for frequently asked questions`;
  

  return {
    type: 'faq',
    text: question,
    label: selectedLanguageKey === 'en' ? 'FAQ' : 'FAQ',
    excerpt: convertStringToExcerpt(answer),
    thumbnailPaths,
    thumbnailDescription,
    points,
    link,
    hash,
    linkTitle
  };
}


// Get search results
const getSearchResultsFromReleases = (releases, searchStringWords, selectedLanguageKey) => {
  const searchResultsFromReleases = releases.map(release => {
    return getSearchPointsFromRelease(release, searchStringWords, selectedLanguageKey);
  });
  return searchResultsFromReleases.filter(result => {
    return result.points && result.points >= 1;
  });
};

const getSearchResultsFromPosts = (posts, searchStringWords, selectedLanguageKey) => {
  const searchResultsFromPosts = posts.map(post => {
    return getSearchPointsFromPost(post, searchStringWords, selectedLanguageKey);
  });
  return searchResultsFromPosts.filter(result => {
    return result.points && result.points >= 1;
  });
};

const getSearchResultsFromVideos = (videos, searchStringWords, selectedLanguageKey) => {
  const searchResultsFromVideos = videos.map(video => {
    return getSearchPointsFromVideos(video, searchStringWords, selectedLanguageKey);
  });
  return searchResultsFromVideos.filter(result => {
    return result.points && result.points >= 1;
  });
};

const getSearchResultsFromProducts = (products, searchStringWords, selectedLanguageKey) => {
  const searchResultsFromProducts = products.map(product => {
    return getSearchPointsFromProduct(product, searchStringWords, selectedLanguageKey);
  });
  return searchResultsFromProducts.filter(result => {
    return result.points && result.points >= 1;
  });
};

const getSearchResultsFromEquipmentTypes = (equipmentTypes, searchStringWords, selectedLanguageKey, searchCategory) => {
  let searchResultsFromEquipmentTypes = [];
  if (searchCategory === 'all') {
    Object.keys(equipmentTypes).forEach(equipmentTypeKey => {
      const equipmentType = equipmentTypes[equipmentTypeKey];
      const searchResultsFromEquipmentType = getSearchResultsFromEquipmentType(equipmentType, equipmentTypeKey, searchStringWords, selectedLanguageKey);
      searchResultsFromEquipmentTypes = searchResultsFromEquipmentTypes.concat(searchResultsFromEquipmentType);
    });
  } else if (['amplifiers', 'effects', 'instruments'].includes(searchCategory)) {
    const equipmentType = equipmentTypes[searchCategory];
    const searchResultsFromEquipmentType = getSearchResultsFromEquipmentType(equipmentType, searchCategory, searchStringWords, selectedLanguageKey);
    searchResultsFromEquipmentTypes = searchResultsFromEquipmentTypes.concat(searchResultsFromEquipmentType);
  } else {
    return [];
  }
  return searchResultsFromEquipmentTypes;
};

const getSearchResultsFromEquipmentType = (equipmentType, equipmentTypeKey, searchStringWords, selectedLanguageKey) => {
  const searchResultsFromEquipmentItems = equipmentType.items.map(item => {
    return getSearchPointsFromEquipmentItems(item, equipmentType, equipmentTypeKey, searchStringWords, selectedLanguageKey);
  })
  return searchResultsFromEquipmentItems.filter(result => {
    return result.points && result.points >= 1;
  });
}

const getSearchResultsFromFrequentlyAskedQuestions = (faqs, searchStringWords, selectedLanguageKey) => {
  const searchResultsFromFrequentlyAskedQuestions = faqs.map(faq => {
    return getSearchPointsFromFrequentlyAskedQuestions(faq, searchStringWords, selectedLanguageKey);
  });
  return searchResultsFromFrequentlyAskedQuestions.filter(result => {
    return result.points && result.points >= 1;
  });
};


export const getSearchResults = (query, selectedLanguageKey, searchCategory = 'all') => {
  let searchString = query.replace(/[^a-å0-9- ]+/ig, ""); // Removes unwanted characters
  searchString = searchString.replace(/\s\s+/g, ' '); // Remove redundant whitespace
  const searchStringWords = searchString.split(" ").filter(searchStringWord => {
    return searchStringWord.length > 1;
  });
  if (searchString.length > 1) {
    const searchResultsFromReleases = searchCategory === 'release' || searchCategory === 'all' ? getSearchResultsFromReleases(releases, searchStringWords, selectedLanguageKey) : [];
    const searchResultsFromPosts = searchCategory === 'post' || searchCategory === 'all' ? getSearchResultsFromPosts(posts, searchStringWords, selectedLanguageKey) : [];
    const searchResultsFromVideos = searchCategory === 'video' || searchCategory === 'all' ? getSearchResultsFromVideos(videos, searchStringWords, selectedLanguageKey) : [];
    const searchResultsFromProducts = searchCategory === 'product' || searchCategory === 'all' ? getSearchResultsFromProducts(products, searchStringWords, selectedLanguageKey) : [];
    const searchResultsFromEquipmentTypes = getSearchResultsFromEquipmentTypes(equipmentTypes, searchStringWords, selectedLanguageKey, searchCategory);
    const searchResultsFromFrequentlyAskedQuestions = searchCategory === 'faq' || searchCategory === 'all' ? getSearchResultsFromFrequentlyAskedQuestions(frequentlyAskedQuestions, searchStringWords, selectedLanguageKey) : [];
    const results = searchResultsFromReleases.concat(searchResultsFromPosts, searchResultsFromVideos, searchResultsFromProducts, searchResultsFromEquipmentTypes, searchResultsFromFrequentlyAskedQuestions);

    return results.sort((a, b) => b.points - a.points);
  } else {
    return null;
  }
}
