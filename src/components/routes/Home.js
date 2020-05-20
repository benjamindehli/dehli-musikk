// Dependencies
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Helmet} from 'react-helmet';
import {Link} from 'react-router-dom';

// Actions
import {getLanguageSlug, updateMultilingualRoutes, updateSelectedLanguageKey} from 'actions/LanguageActions';

// Components
import IntroContent from 'components/partials/IntroContent';
import Button from 'components/partials/Button';
import SocialMediaLinks from 'components/partials/SocialMediaLinks';
import LatestPosts from 'components/partials/LatestPosts';

import DehliMusikkLogo from 'assets/svg/DehliMusikkLogoInverse.svg'

// Stylesheets
import style from 'components/routes/Home.module.scss';

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
    return (<picture className={style.backgroundsImage}>{srcSets}<img src={headerImage.jpg[1024]} alt='A Korg MS-20 with a cassette and tape recorder' copyright="cc-by 2019 Benjamin Dehli dehlimusikk.no"/></picture>);
  }

  render() {
    const metaDescription = this.props.selectedLanguageKey === 'en'
        ? 'Offers keyboard instrument tracks for artists and bands'
        : 'Tilbyr spilling av tangentinstrumenter på låter for artister og band';
    return (<div>
      <Helmet htmlAttributes={{ lang : this.props.selectedLanguageKey }}>
        <title>Dehli Musikk</title>
        <meta name='description' content={metaDescription}/>
        <link rel="canonical" href={`https://www.dehlimusikk.no/${this.props.getLanguageSlug(this.props.selectedLanguageKey)}`}/>
        <link rel="alternate" href={`https://www.dehlimusikk.no/`} hreflang="no"/>
        <link rel="alternate" href={`https://www.dehlimusikk.no/en/`} hreflang="en"/>
        <link rel="alternate" href={`https://www.dehlimusikk.no/`} hreflang="x-default"/>
        <meta property="og:title" content="Dehli Musikk" />
        <meta property="og:url" content={`https://www.dehlimusikk.no/${this.props.getLanguageSlug(this.props.selectedLanguageKey)}`} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:locale" content={this.props.selectedLanguageKey === 'en' ? 'en_US' : 'no_NO'} />
        <meta property="og:locale:alternate" content={this.props.selectedLanguageKey === 'en' ? 'nb_NO' : 'en_US'} />
        <meta property="twitter:title" content="Dehli Musikk" />
        <meta property="twitter:description" content={metaDescription} />
      </Helmet>
      <div className={style.header}>
        {this.renderHeaderImage()}
        <div className={style.overlay}>
          <span className={style.logo}>
            <img src={DehliMusikkLogo} alt='Logo for Dehli Musikk' copyright="cc-by 2019 Benjamin Dehli dehlimusikk.no" />
          </span>
        </div>
      </div>

      <div className={style.contentSection}>
        <header>
          <h1>Dehli Musikk</h1>
        </header>
      <IntroContent />
      </div>
      <div className={style.latestPostsSection}>
        <div className={`${style.contentSection} ${style.fullWidthSm}`}>
          <h2>{
              this.props.selectedLanguageKey === 'en'
                ? 'Latest updates'
                : 'Siste oppdateringer'
            }</h2>
          <LatestPosts/>
          <div className={style.callToAction}>
            {
              this.props.selectedLanguageKey === 'en'
                ? (<Link to={`/${this.props.getLanguageSlug(this.props.selectedLanguageKey)}posts/`} title='See all posts'>
                  <Button>See all posts</Button>
                </Link>)
                : (<Link to={`/${this.props.getLanguageSlug(this.props.selectedLanguageKey)}posts/`} title='Se alle innlegg'>
                  <Button>Se alle innlegg</Button>
                </Link>)
            }
          </div>
        </div>
      </div>
      <div className={style.socialMediaSection}>
        <div className={style.contentSection}>
          <h2>{
              this.props.selectedLanguageKey === 'en'
                ? 'Follow Dehli Musikk on social media'
                : 'Følg Dehli Musikk på sosiale medier'
            }</h2>
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
