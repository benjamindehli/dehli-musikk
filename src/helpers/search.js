// Helpers
import {convertToUrlFriendlyString} from 'helpers/urlFormatter';

// Data
import releases from 'data/portfolio';
import posts from 'data/posts';
import products from 'data/products';
import equipmentTypes from 'data/equipment';

const getLanguageSlug = selectedLanguageKey => {
  return selectedLanguageKey === 'en' ? 'en/' : '';
};


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

  const thumbnailPaths = {
    webp: require(`../data/releases/thumbnails/web/webp/${release.thumbnailFilename}_55.webp`),
    jpg: require(`../data/releases/thumbnails/web/jpg/${release.thumbnailFilename}_55.jpg`)
  };
  const thumbnailDescription = selectedLanguageKey === 'en' ? `Cover image for ${release.title} by ${release.artistName}` : `Coverbilde til ${release.title} av ${release.artistName}`;

  return {
    type: 'release',
    text: `${release.artistName} - ${release.title} (${release.genre})`,
    label: selectedLanguageKey === 'en' ? 'Releases' : 'Utgivelser',
    thumbnailPaths,
    thumbnailDescription,
    points,
    link,
    linkTitle
  }
}

const getSearchPointsFromPost = (post, searchStringWords, selectedLanguageKey) => {
  const id = convertToUrlFriendlyString(post.title[selectedLanguageKey]);
  const link = `/${getLanguageSlug(selectedLanguageKey)}posts/${id}/`;
  const linkTitle = post.title[selectedLanguageKey];

  let titlePoints = 0;
  let contentPoints = 0;

  searchStringWords.forEach(searchStringWord => {
    const regex = new RegExp(searchStringWord, "gi");

    const titleMatch = post.title[selectedLanguageKey].match(regex);
    const contentMatch = post.content[selectedLanguageKey].match(regex);

    titlePoints += titleMatch ? titleMatch.length * 5 : 0;
    contentPoints += contentMatch ? contentMatch.length : 0;
  });

  const points = (titlePoints + contentPoints) / searchStringWords.length;

  const thumbnailPaths = {
    webp: require(`../data/posts/thumbnails/web/webp/${post.thumbnailFilename}_55.webp`),
    jpg: require(`../data/posts/thumbnails/web/jpg/${post.thumbnailFilename}_55.jpg`)
  };
  const thumbnailDescription = post.thumbnailDescription;

  return {
    type: 'post',
    text: post.title[selectedLanguageKey],
    label: selectedLanguageKey === 'en' ? 'Posts' : 'Innlegg',
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
    const contentMatch = product.content[selectedLanguageKey].match(regex);

    titlePoints += titleMatch ? titleMatch.length * 10 : 0;
    contentPoints += contentMatch ? contentMatch.length*2 : 0;
  });

  const points = (titlePoints + contentPoints) / searchStringWords.length;

  const thumbnailPaths = {
    webp: require(`../data/products/thumbnails/web/webp/${id}_55.webp`),
    jpg: require(`../data/products/thumbnails/web/jpg/${id}_55.jpg`)
  };
  const thumbnailDescription = linkTitle;

  return {
    type: 'product',
    text: product.title,
    label: selectedLanguageKey === 'en' ? 'Products' : 'Produkter',
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
    const equipmentTypeMatch = equipmentType.name[selectedLanguageKey].match(regex);

    brandPoints += brandMatch ? brandMatch.length * 7 : 0;
    modelPoints += modelMatch ? modelMatch.length * 7 : 0;
    equipmentTypePoints += equipmentTypeMatch ? equipmentTypeMatch.length * 1 : 0;
  });

  const points = (brandPoints + modelPoints + equipmentTypePoints) / searchStringWords.length;

  const thumbnailPaths = {
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

const getSearchResultsFromProducts = (products, searchStringWords, selectedLanguageKey) => {
  const searchResultsFromProducts = products.map(product => {
    return getSearchPointsFromProduct(product, searchStringWords, selectedLanguageKey);
  });
  return searchResultsFromProducts.filter(result => {
    return result.points && result.points >= 1;
  });
};

const getSearchResultsFromEquipmentTypes = (equipmentTypes, searchStringWords, selectedLanguageKey) => {
  let searchResultsFromEquipmentTypes = [];
  Object.keys(equipmentTypes).forEach(equipmentTypeKey => {
    const equipmentType = equipmentTypes[equipmentTypeKey];
    const searchResultsFromEquipmentType = getSearchResultsFromEquipmentType(equipmentType, equipmentTypeKey, searchStringWords, selectedLanguageKey);
    searchResultsFromEquipmentTypes = searchResultsFromEquipmentTypes.concat(searchResultsFromEquipmentType);
  });
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


export const getSearchResults = (query, selectedLanguageKey) => {
  let searchString = query.replace(/[^a-å0-9- ]+/ig, ""); // Removes unwanted characters
  searchString = searchString.replace(/\s\s+/g, ' '); // Remove redundant whitespace
  const searchStringWords = searchString.split(" ").filter(searchStringWord => {
    return searchStringWord.length > 1;
  });
  if (searchString.length > 1) {
    const searchResultsFromReleases = getSearchResultsFromReleases(releases, searchStringWords, selectedLanguageKey);
    const searchResultsFromPosts = getSearchResultsFromPosts(posts, searchStringWords, selectedLanguageKey);
    const searchResultsFromProducts = getSearchResultsFromProducts(products, searchStringWords, selectedLanguageKey);
    const searchResultsFromEquipmentTypes = getSearchResultsFromEquipmentTypes(equipmentTypes, searchStringWords, selectedLanguageKey);
    const results = searchResultsFromReleases.concat(searchResultsFromPosts, searchResultsFromProducts, searchResultsFromEquipmentTypes);

    return results.sort((a, b) => b.points - a.points);
  } else {
    return null;
  }
}
