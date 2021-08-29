// Dependencies
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Helmet} from 'react-helmet';
import {Link} from 'react-router-dom';

// Actions
import {getLanguageSlug, updateMultilingualRoutes, updateSelectedLanguageKey} from 'actions/LanguageActions';

// Components
import Button from 'components/partials/Button';
import Container from 'components/template/Container';
import IntroContent from 'components/partials/IntroContent';
import LatestPosts from 'components/partials/LatestPosts';
import LatestProducts from 'components/partials/LatestProducts';
import LatestReleases from 'components/partials/LatestReleases';
import LatestVideos from 'components/partials/LatestVideos';
import SocialMediaLinks from 'components/partials/SocialMediaLinks';

// Assets
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
      avif: {
        480: require(`../../${imagePath}_480.avif`).default,
        640: require(`../../${imagePath}_640.avif`).default,
        800: require(`../../${imagePath}_800.avif`).default,
        1024: require(`../../${imagePath}_1024.avif`).default,
        1260: require(`../../${imagePath}_1260.avif`).default,
        1440: require(`../../${imagePath}_1440.avif`).default,
        1680: require(`../../${imagePath}_1680.avif`).default
      },
      webp: {
        480: require(`../../${imagePath}_480.webp`).default,
        640: require(`../../${imagePath}_640.webp`).default,
        800: require(`../../${imagePath}_800.webp`).default,
        1024: require(`../../${imagePath}_1024.webp`).default,
        1260: require(`../../${imagePath}_1260.webp`).default,
        1440: require(`../../${imagePath}_1440.webp`).default,
        1680: require(`../../${imagePath}_1680.webp`).default
      },
      jpg: {
        480: require(`../../${imagePath}_480.jpg`).default,
        640: require(`../../${imagePath}_640.jpg`).default,
        800: require(`../../${imagePath}_800.jpg`).default,
        1024: require(`../../${imagePath}_1024.jpg`).default,
        1260: require(`../../${imagePath}_1260.jpg`).default,
        1440: require(`../../${imagePath}_1440.jpg`).default,
        1680: require(`../../${imagePath}_1680.jpg`).default
      }
    };
    const srcSets = Object.keys(headerImage).map(fileType => {
      const srcSet = Object.keys(headerImage[fileType]).map(imageSize => {
        return `${headerImage[fileType][imageSize]} ${imageSize}w`
      })
      const sizes = "100vw"
      return (<source sizes={sizes} key={fileType} srcSet={srcSet} type={`image/${fileType}`}/>)
    })
    return (<picture className={style.backgroundsImage}>{srcSets}<img src={headerImage.jpg[1024]} alt='A Korg MS-20 with a cassette and tape recorder' /></picture>);
  }

  render() {
    const metaDescription = this.props.selectedLanguageKey === 'en'
        ? 'Dehli Musikk is a sole proprietorship run by Benjamin Dehli which offers keyboard instrument tracks on recordings for artists and bands'
        : 'Dehli Musikk er et enkeltpersonsforetak drevet av Benjamin Dehli som tilbyr spilling av tangentinstrumenter på låter for artister og band';
    return (<React.Fragment>
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
            <img src={DehliMusikkLogo} alt='Logo for Dehli Musikk' width="350" height="207" />
          </span>
        </div>
      </div>

      <div className={style.contentSection}>
        <header>
          <h1>Dehli Musikk</h1>
        </header>
      <IntroContent />
      </div>
      <div className={style.mutedSection}>
        <Container>
          <h2 className={style.sectionHeader}>{
              this.props.selectedLanguageKey === 'en'
                ? 'Latest updates'
                : 'Siste oppdateringer'
            }</h2>
          <LatestPosts/>
          <div className={style.callToActionButtonContainer}>
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
        </Container>
      </div>
      <div>
        <Container>
          <h2 className={style.sectionHeader}>{
            this.props.selectedLanguageKey === 'en'
              ? 'Latest releases'
              : 'Siste utgivelser'
          }</h2>
          <LatestReleases />
          <div className={style.callToActionButtonContainer}>
            {
              this.props.selectedLanguageKey === 'en'
                ? (<Link to={`/${this.props.getLanguageSlug(this.props.selectedLanguageKey)}portfolio/`} title='See all releases'>
                  <Button>See all releases</Button>
                </Link>)
                : (<Link to={`/${this.props.getLanguageSlug(this.props.selectedLanguageKey)}portfolio/`} title='Se alle utgivelser'>
                  <Button>Se alle utgivelser</Button>
                </Link>)
            }
          </div>
        </Container>
      </div>
      <div className={style.mutedSection}>
        <Container>
          <h2 className={style.sectionHeader}>{
              this.props.selectedLanguageKey === 'en'
                ? 'Latest videoe'
                : 'Siste videoer'
            }</h2>
          <LatestVideos/>
          <div className={style.callToActionButtonContainer}>
            {
              this.props.selectedLanguageKey === 'en'
                ? (<Link to={`/${this.props.getLanguageSlug(this.props.selectedLanguageKey)}videos/`} title='See all videos'>
                  <Button>See all videos</Button>
                </Link>)
                : (<Link to={`/${this.props.getLanguageSlug(this.props.selectedLanguageKey)}videos/`} title='Se alle videoer'>
                  <Button>Se alle videoer</Button>
                </Link>)
            }
          </div>
        </Container>
      </div>
      <div>
        <Container>
          <h2 className={style.sectionHeader}>{
              this.props.selectedLanguageKey === 'en'
                ? 'Newest products'
                : 'Nyeste produkter'
            }</h2>
          <LatestProducts/>
          <div className={style.callToActionButtonContainer}>
            {
              this.props.selectedLanguageKey === 'en'
                ? (<Link to={`/${this.props.getLanguageSlug(this.props.selectedLanguageKey)}products/`} title='See all products'>
                  <Button>See all products</Button>
                </Link>)
                : (<Link to={`/${this.props.getLanguageSlug(this.props.selectedLanguageKey)}products/`} title='Se alle produkter'>
                  <Button>Se alle produkter</Button>
                </Link>)
            }
          </div>
        </Container>
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
    </React.Fragment>)
  }
}

const mapStateToProps = state => ({selectedLanguageKey: state.selectedLanguageKey});

const mapDispatchToProps = {
  getLanguageSlug,
  updateMultilingualRoutes,
  updateSelectedLanguageKey
};

export default connect(mapStateToProps, mapDispatchToProps)(Home);
