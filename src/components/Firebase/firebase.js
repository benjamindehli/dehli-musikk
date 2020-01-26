import app from 'firebase/app';
import 'firebase/storage';
import "firebase/firestore";
//import "firebase/analytics";

const config = {
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_DATABASE_URL,
  projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_APP_ID,
  measurementId: process.env.REACT_APP_MEASUREMENT_ID
};


class Firebase {
  constructor() {
    app.initializeApp(config);
    // app.analytics();
    // app.firestore().enablePersistence()
    this.getArtists = this.getArtists.bind(this);
    this.getReleasesByArtistId = this.getReleasesByArtistId.bind(this);
    this.getTemplateImage = this.getTemplateImage.bind(this);
    this.getReleaseThumbnail = this.getReleaseThumbnail.bind(this);
  }

  getArtists(){
    const artists = app.firestore().collection('artists').orderBy('artistName', 'asc');
    return artists.get().then(querySnapshot => {
      let datas = [];
       querySnapshot.forEach(doc => {
         datas.push({
           ...doc.data(),
           id: doc.id
         });
      })
      return datas;
    })
  }

  getReleasesByArtistId(artistId){
    const artist = app.firestore().collection('artists').doc(artistId);
    if (artist.collection && artist.collection('releases')) {
      return artist.collection('releases').orderBy('title', 'asc').get().then(querySnapshot => {
        let releases = [];
         querySnapshot.forEach(doc => {
           releases.push({
             ...doc.data(),
             id: doc.id
           });
        })
        return releases;
      })
    }else {
      console.log('cant find releases for artist: ' + artistId);
      return null;
    }
  }

  getTemplateImage(){
    const images = {};
    // Points to the root reference
    const storageRef = app.storage().ref();

    // Points to 'images'
    const templateImagesRef = storageRef.child('template');

    const sizes = [480, 640, 800, 1024, 1260, 1440, 1680];
    const filetypes = ['jpg', 'webp'];

    filetypes.forEach(filetype => {
      images[filetype] = images[filetype] ? images[filetype] : {};
      sizes.forEach(size => {
        images[filetype][size] = images[filetype][size] ? images[filetype][size] : {};
        const imageRef = templateImagesRef.child(`header_${size}.${filetype}`);
        images[filetype][size] = imageRef;
      })
    })
    return images;
  }

  getReleaseThumbnail(thumbnailFilename){
    const images = {};
    // Points to the root reference
    const storageRef = app.storage().ref();

    // Points to 'images'
    const releaseImagesRef = storageRef.child('releases');

    const sizes = [350, 55];
    const filetypes = ['jpg', 'webp'];

    filetypes.forEach(filetype => {
      images[filetype] = images[filetype] ? images[filetype] : {};
      sizes.forEach(size => {
        images[filetype][size] = images[filetype][size] ? images[filetype][size] : {};
        const imageRef = releaseImagesRef.child(`${thumbnailFilename}_${size}.${filetype}`);
        images[filetype][size] = imageRef;
      })
    })
    return images;
  }
}

export default Firebase;
