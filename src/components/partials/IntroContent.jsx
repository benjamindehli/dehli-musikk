// Dependencies
import { getArtistNamesStringFromReleases } from '../../helpers/releaseHelpers';
import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

// Selectors
import { getLanguageSlug } from '../../reducers/AvailableLanguagesReducer';

// Data
import releases from "../../data/portfolio";

const IntroContent = () => {

  // Redux store
  const selectedLanguageKey = useSelector(state => state.selectedLanguageKey)
  const languageSlug = useSelector(state => getLanguageSlug(state));

  const facebookLink = "https://www.facebook.com/DehliMusikk/";
  const emailLink = "mailto:superelg@gmail.com";

  const artistNamesString = getArtistNamesStringFromReleases(releases, selectedLanguageKey);

  const norwegianContent = (<React.Fragment>
    <p>Dehli Musikk er et enkeltpersonsforetak drevet av keyboardist og produsent Benjamin Dehli og tilbyr spilling av tangentinstrumenter på låter for artister og band.</p>
    <p>Har du en låt som skal spilles inn og mangler tangenter, ta gjerne kontakt på <a href={facebookLink} title="Dehli Musikks Facebook-side" target='_blank' rel="noopener noreferrer">Facebook</a> eller <a href={emailLink} title="Send Dehli Musikk en e-post">e-post</a>.</p>
    <p>Sjekk ut <Link to={`/${languageSlug}portfolio/`} title="Dehli Musikks portefølje">porteføljen</Link> om du vil høre utgivelser Benjamin Dehli (Dehli Musikk) har bidratt på.</p>
    <h2>Artister som Dehli Musikk har samarbeidet med</h2>
    <p>{artistNamesString}.</p>

  </React.Fragment>);

  const englishContent = (<React.Fragment>
    <p>Dehli Musikk is a sole proprietorship run by keyboard player and producer Benjamin Dehli and offers keyboard instrument tracks on recordings for artists and bands.</p>
    <p>If you're recording a song and want some keyboard instrument tracks, feel free to contact me on  <a href={facebookLink} title="Dehli Musikk's Facebook page" target='_blank' rel="noopener noreferrer">Facebook</a> or <a href={emailLink} title="Send Dehli Musikk an email">email</a>.</p>
    <p>Check out the <Link to={`/${languageSlug}portfolio/`} title="Dehli Musikk's portfolio">portfolio</Link> if you want to hear releases where Benjamin Dehli (Dehli Musikk) contributed.</p>
    <h2>Artists who have collaborated with Dehli Musikk</h2>
    <p>{artistNamesString}.</p>
  </React.Fragment>);
  return (<div>
    {selectedLanguageKey === 'en' ? englishContent : norwegianContent}
  </div>)
}

export default IntroContent;
