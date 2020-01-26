// Dependencies
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Helmet} from 'react-helmet';
import {Link} from 'react-router-dom';


// Actions
import {getLanguageSlug, updateMultilingualRoutes, updateSelectedLanguageKey} from '../../actions/LanguageActions';

// Components
import SocialMediaLinks from '../partials/SocialMediaLinks';

import DehliMusikkLogo from '../../assets/svg/DehliMusikkLogoInverse.svg'

// Stylesheets
import style from './Home.module.scss';

class Home extends Component {

  initLanguage() {
    this.props.updateMultilingualRoutes('');
    const selectedLanguageKey = this.props.match && this.props.match.params && this.props.match.params.selectedLanguage
      ? this.props.match.params.selectedLanguage
      : 'no';
    if (selectedLanguageKey !== this.props.selectedLanguageKey) {
      this.props.updateSelectedLanguageKey(selectedLanguageKey);
    }
  }

  componentDidMount() {
    this.initLanguage();
  }

  renderHeaderImage() {
    const imagePath = `assets/images/header`;
    const headerImage = {
      webp: {
        480: require(`../../${imagePath}_480.webp`),
        640: require(`../../${imagePath}_640.webp`),
        800: require(`../../${imagePath}_800.webp`),
        1024: require(`../../${imagePath}_1024.webp`),
        1260: require(`../../${imagePath}_1260.webp`),
        1440: require(`../../${imagePath}_1440.webp`),
        1680: require(`../../${imagePath}_1680.webp`)
      },
      jpg: {
        480: require(`../../${imagePath}_480.jpg`),
        640: require(`../../${imagePath}_640.jpg`),
        800: require(`../../${imagePath}_800.jpg`),
        1024: require(`../../${imagePath}_1024.jpg`),
        1260: require(`../../${imagePath}_1260.jpg`),
        1440: require(`../../${imagePath}_1440.jpg`),
        1680: require(`../../${imagePath}_1680.jpg`)
      }
    };
    const srcSets = Object.keys(headerImage).map(fileType => {
      const srcSet = Object.keys(headerImage[fileType]).map(imageSize => {
        return `${headerImage[fileType][imageSize]} ${imageSize}w`
      })
      return (<source key={fileType} srcSet={srcSet} type={`image/${fileType}`}/>)
    })
    return (<picture className={style.backgroundsImage}>{srcSets}<img src={headerImage.jpg[1024]} alt='Header'/></picture>);
  }

  render() {

    return (<div>
      <Helmet>
        <title>Dehli Musikk</title>
        <meta name='description' content={this.props.selectedLanguageKey === 'en'
            ? 'Offers keyboard instrument tracks for artists and bands'
            : 'Tilbyr spilling av tangentinstrumenter på låter for artister og band'}/>
        <link rel="canonical" href={`https://www.dehlimusikk.no/${this.props.getLanguageSlug(this.props.selectedLanguageKey)}`}/>
        <link rel="alternate" href={`https://www.dehlimusikk.no/`} hreflang="no"/>
        <link rel="alternate" href={`https://www.dehlimusikk.no/en`} hreflang="en"/>
        <link rel="alternate" href={`https://www.dehlimusikk.no/`} hreflang="x-default"/>
      </Helmet>
      <div className={style.header}>
        {this.renderHeaderImage()}
        <div className={style.overlay}>
          <span className={style.logo}>
            <img src={DehliMusikkLogo} alt='Logo for Dehli Musikk'/>
          </span>
        </div>
      </div>

      <div className={style.contentSection}>
      <header>
        <h1>{
            this.props.selectedLanguageKey === 'en'
              ? 'The website is under development'
              : 'Nettsiden er under utvikling'
          }</h1>
          </header>
          {
              this.props.selectedLanguageKey === 'en'
                ? (<p>Content coming soon. In the meantime, you can check out my <Link to={`/${this.props.getLanguageSlug(this.props.selectedLanguageKey)}portfolio`}>portfolio</Link> or visit some of my social media links below</p>)
                : (<p>Innhold kommer snart. Inntil videre kan du sjekke ut min <Link to={`/${this.props.getLanguageSlug(this.props.selectedLanguageKey)}portfolio`}>portefølje</Link> eller besøke noen av mine sosiale medier lenker under</p>)
            }
      </div>
      <div className={style.socialMediaSection}>
        <div className={style.contentSection}>
          <SocialMediaLinks/>
        </div>
      </div>
    </div>)
  }
}

const mapStateToProps = state => ({selectedLanguageKey: state.selectedLanguageKey});

const mapDispatchToProps = {
  getLanguageSlug,
  updateMultilingualRoutes,
  updateSelectedLanguageKey
};

export default connect(mapStateToProps, mapDispatchToProps)(Home);
