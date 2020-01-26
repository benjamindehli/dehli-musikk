export const fetchReleasesThumbnail = (firebase, thumbnailFilename, size, type) => (dispatch, getState) => {

  const isFetched = getState().releaseThumbnails && getState().releaseThumbnails[thumbnailFilename + size + type];
  let releaseThumbnailObject = {};

  if (!isFetched) {
    const releaseThumbnail = firebase.getReleaseThumbnail(thumbnailFilename);
    if (releaseThumbnail) {
      Object.keys(releaseThumbnail).forEach(fileType => {
        const releaseThumbnailWithFileType = releaseThumbnail[fileType];
        Object.keys(releaseThumbnailWithFileType).forEach(imageSize => {

          releaseThumbnailWithFileType[imageSize].getDownloadURL().then(url => {

              releaseThumbnailObject = {
                ...releaseThumbnailObject,
                [fileType]: {
                  ...releaseThumbnailObject[fileType],
                  [imageSize]: {
                    srcSet: `${url} ${imageSize}w`,
                    url: url
                  }
                }
              }
          })
        });
      })
    }
  }
}
