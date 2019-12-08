// Dependencies
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router-dom';
import {Helmet} from 'react-helmet-async';

// Actions
import { getLanguageSlug, updateMultilingualRoutes, updateSelectedLanguageKey } from '../../actions/LanguageActions';

// Components
import {withFirebase} from '../Firebase';
import SocialMediaLinks from '../partials/SocialMediaLinks';
import Button from '../partials/Button';

// Assets
import header1680 from '../../assets/images/header_1680.jpg';

import DehliMusikkLogo from '../../assets/svg/DehliMusikkLogoInverse.svg'

// Stylesheets
import style from './Home.module.scss';

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      headerImage: {
        webp:{},
        jpg:{}
      }
    };
  }

  initLanguage(){
    this.props.updateMultilingualRoutes('');
    const selectedLanguageKey = this.props.match && this.props.match.params && this.props.match.params.selectedLanguage ? this.props.match.params.selectedLanguage : 'no';
    if (selectedLanguageKey !== this.props.selectedLanguageKey){
      this.props.updateSelectedLanguageKey(selectedLanguageKey);
    }
  }

  componentDidMount() {
    this.initLanguage();
    const headerImage = this.props.firebase.getTemplateImage('header');
    if (headerImage) {
      Object.keys(headerImage).forEach(fileType => {
        const headerImageWithFileType = headerImage[fileType];
        Object.keys(headerImageWithFileType).forEach(imageSize => {
          headerImageWithFileType[imageSize].getDownloadURL().then(url => {
            this.setState({
              headerImage: {
                ...this.state.headerImage,
                [fileType]: {
                  ...this.state.headerImage[fileType],
                  [imageSize]: `${url} ${imageSize}w`
                }
              }
            })
          })
        });
      })
    }
  }

  renderHeaderImage(headerImage){
    const srcSets = Object.keys(headerImage).map(fileType => {
      const srcSet = Object.keys(headerImage[fileType]).map(imageSize => {
        return headerImage[fileType][imageSize];
      })
      return (<source key={fileType} srcSet={srcSet} type={`image/${fileType}`}/>)
    })
    return (<picture className={style.backgroundsImage}>{srcSets}<img src={header1680} alt='Header' /></picture>);
  }

  render() {
    return (<div>
      <Helmet>
        <meta name='description' content={this.props.selectedLanguageKey == 'en' ? 'Offers keyboard instrument tracks for artists and bands' : 'Tilbyr spilling av tangentinstrumenter på låter for artister og band'} />
        <link rel="canonical" href={`${window.location.origin}/${this.props.getLanguageSlug(this.props.selectedLanguageKey)}`} />
        <link rel="alternate" href={`${window.location.origin}`} hreflang="no" />
        <link rel="alternate" href={`${window.location.origin}/en`} hreflang="en" />
        <link rel="alternate" href={`${window.location.origin}`} hreflang="x-default" />
      </Helmet>
      <div className={style.header}>
      {this.renderHeaderImage(this.state.headerImage)}
        <div className={style.overlay}>
          <span className={style.logo}>
            <img src={DehliMusikkLogo} alt='Logo for Dehli Musikk'/>
          </span>
        </div>
      </div>

      <div className={style.contentSection}>
        <h1>{this.props.selectedLanguageKey == 'en' ? 'Coming soon' : 'Kommer snart'}</h1>
        <p>{this.props.selectedLanguageKey == 'en' ? 'The website is under development' : 'Nettsiden er under utvikling'}</p>
      </div>
      <div className={style.socialMediaSection}>
        <div className={style.contentSection}>
          <SocialMediaLinks/>
        </div>
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

export default connect(mapStateToProps, mapDispatchToProps)(withFirebase(Home));
