import { CREATE_RELEASE, UPDATE_RELEASES } from 'constants/types';

export const createRelease = (releases = []) => {
  let newReleases = releases.slice()
  newReleases.splice(0, 0, {
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
  return { type: CREATE_RELEASE, payload: newReleases };
}

export const updateReleases = releases => {
  return { type: UPDATE_RELEASES, payload: releases };
}
