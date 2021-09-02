import { CREATE_RELEASE, UPDATE_RELEASES } from 'constants/types';

export const createRelease = (releases = []) => dispatch => {
  releases.unshift({
    id: '',
    releaseId: '',
    artistName: '',
    title: '',
    duration: 0,
    durationISO: '',
    isrcCode: '',
    genre: '',
    releaseDate: 0,
    spotifyThumbnailUrl: '',
    thumbnailFilename: '',
    links: {
    }
  });
  dispatch({ type: CREATE_RELEASE, payload: releases });
}

export const updateReleases = releases => dispatch => {
  dispatch({ type: UPDATE_RELEASES, payload: releases });
}
