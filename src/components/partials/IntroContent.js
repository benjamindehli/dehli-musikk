// Dependencies
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router-dom';

// Actions
import {getLanguageSlug} from 'actions/LanguageActions';

class IntroContent extends Component {
  render() {
    const facebookLink = "https://www.facebook.com/DehliMusikk/";
    const emailLink = "mailto:superelg@gmail.com";

    const norwegianContent = (<React.Fragment>
      <p>Dehli Musikk tilbyr spilling av tangentinstrumenter på låter for artister og band.</p>
      <p>Har du en låt som skal spilles inn og mangler tangeter, ta gjerne kontakt på <a href={facebookLink} title="Dehli Musikks Facebook-side" target='_blank' rel="noopener noreferrer">Facebook</a> eller <a href={emailLink} title="Send Dehli Musikk en e-post">e-post</a>.</p>
      <p>Sjekk ut min <Link to={`/${this.props.getLanguageSlug(this.props.selectedLanguageKey)}portfolio/`} title="Dehli Musikks portefølje">portefølje</Link> om du vil høre utgivelser jeg har bidratt på.</p>
    </React.Fragment>);

    const englishContent = (<React.Fragment>
      <p>Dehli Musikk offers playing of keyboard instruments on recordings for artists and bands.</p>
      <p>If you're recording a song and want some keyboard instrument tracks, feel free to contact me on  <a href={facebookLink} title="Dehli Musikk's Facebook page" target='_blank' rel="noopener noreferrer">Facebook</a> or <a href={emailLink} title="Send Dehli Musikk an email">email</a>.</p>
      <p>Check out my <Link to={`/${this.props.getLanguageSlug(this.props.selectedLanguageKey)}portfolio/`} title="Dehli Musikk's portfolio">portfolio</Link> if you want to hear releases where I've contributed.</p>
    </React.Fragment>);
    return (<div>
      {
        this.props.selectedLanguageKey === 'en' ? englishContent : norwegianContent
      }
    </div>)
  }
}

const mapStateToProps = state => ({selectedLanguageKey: state.selectedLanguageKey});

const mapDispatchToProps = {
  getLanguageSlug
};

export default connect(mapStateToProps, mapDispatchToProps)(IntroContent);
