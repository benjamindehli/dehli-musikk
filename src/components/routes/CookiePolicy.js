// Dependencies
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Helmet} from 'react-helmet-async';

// Actions
import { getLanguageSlug, updateMultilingualRoutes, updateSelectedLanguageKey } from '../../actions/LanguageActions';

// Components
import {withFirebase} from '../Firebase';
import CookiePolicyEnglish from '../partials/Policies/CookiePolicyEnglish';

class CookiePolicy extends Component {

  initLanguage(){
    this.props.updateMultilingualRoutes('cookie-policy');
    const selectedLanguageKey = this.props.match && this.props.match.params && this.props.match.params.selectedLanguage ? this.props.match.params.selectedLanguage : 'no';
    if (selectedLanguageKey !== this.props.selectedLanguageKey){
      this.props.updateSelectedLanguageKey(selectedLanguageKey);
    }
  }

  componentDidMount() {
    this.initLanguage();
  }


  render() {
    return (<div>
      <Helmet>
      <title>{this.props.selectedLanguageKey === 'en' ? 'Cookie Policy' : 'Cookie-erklæring'} - Dehli Musikk</title>
      <meta name='description' content={this.props.selectedLanguageKey === 'en' ? 'Cookie Policy for Dehli Musikk\'s website' : 'Cookie-erklæring for Dehli Musikks nettsted'} />
      <link rel="canonical" href={`${window.location.origin}/${this.props.getLanguageSlug(this.props.selectedLanguageKey)}cookie-policy`} />
      <link rel="alternate" href={`${window.location.origin}/cookie-policy`} hreflang="no" />
      <link rel="alternate" href={`${window.location.origin}/en/cookie-policy`} hreflang="en" />
      <link rel="alternate" href={`${window.location.origin}/cookie-policy`} hreflang="x-default" />
      </Helmet>

      <div className='padding'>
        <h1>{this.props.selectedLanguageKey === 'en' ? 'Cookie Policy for Dehli Musikk' : 'Cookie-erklæring for Dehli Musikk'}</h1>
        <CookiePolicyEnglish />
      </div>
    </div>)
  }
}

const mapStateToProps = state => ({
  selectedLanguageKey: state.selectedLanguageKey
});

const mapDispatchToProps = {
  getLanguageSlug,
  updateMultilingualRoutes,
  updateSelectedLanguageKey
};

export default connect(mapStateToProps, mapDispatchToProps)(withFirebase(CookiePolicy));
