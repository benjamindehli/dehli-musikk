// Dependencies
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Helmet} from 'react-helmet';
import {Redirect} from 'react-router-dom';

// Components
import Release from 'components/partials/Portfolio/Release';
import Breadcrumbs from 'components/partials/Breadcrumbs';

// Template
import Container from 'components/template/Container';
import List from 'components/template/List';
import ListItem from 'components/template/List/ListItem';
import Modal from 'components/template/Modal';

// Actions
import { getLanguageSlug, updateMultilingualRoutes, updateSelectedLanguageKey } from 'actions/LanguageActions';

// Helpers
import {convertToUrlFriendlyString} from 'helpers/urlFormatter'

// Data
import releases from 'data/portfolio';


class Portfolio extends Component {
  constructor(props) {
    super(props);
    this.state = {
      redirect: null
    };
  }

  initLanguage(){
    this.props.updateMultilingualRoutes('portfolio/');
    const selectedLanguageKey = this.props.match && this.props.match.params && this.props.match.params.selectedLanguage ? this.props.match.params.selectedLanguage : 'no';
    if (selectedLanguageKey !== this.props.selectedLanguageKey){
      this.props.updateSelectedLanguageKey(selectedLanguageKey);
    }
  }

  componentDidMount() {
    this.initLanguage();
  }

  componentDidUpdate(){
    if (this.state.redirect) {
      this.setState({redirect: null});
    }
  }

  renderReleases() {
    return releases && releases.length
      ? releases.map(release => {
        return (<ListItem key={release.id} fullscreen={this.props.fullscreen}>
            <Release release={release} />
          </ListItem>)
      })
      : '';
  }

  renderSelectedRelease(selectedRelease) {
    const handleClickOutside = () => {
      this.setState({
        redirect: `/${this.props.getLanguageSlug(this.props.selectedLanguageKey)}portfolio/`
      });
    };
    const handleClickArrowLeft = selectedRelease && selectedRelease.previousReleaseId ? () => {
      this.setState({
        redirect: `/${this.props.getLanguageSlug(this.props.selectedLanguageKey)}portfolio/${selectedRelease.previousReleaseId}/`
      });
    } : null;
    const handleClickArrowRight = selectedRelease && selectedRelease.nextReleaseId ? () => {
      this.setState({
        redirect: `/${this.props.getLanguageSlug(this.props.selectedLanguageKey)}portfolio/${selectedRelease.nextReleaseId}/`
      });
    } : null;
    return selectedRelease
      ? (<Modal onClickOutside={handleClickOutside} maxWidth="540px" onClickArrowLeft={handleClickArrowLeft} onClickArrowRight={handleClickArrowRight}>
        <Release release={selectedRelease} fullscreen={true} />
      </Modal>)
      : '';
  }

  getSelectedRelease(selectedReleaseId, selectedLanguageKey){
    let selectedRelease = null;
    releases.forEach((release, index) => {
      const releaseId = convertToUrlFriendlyString(`${release.artistName} ${release.title}`)
      if (releaseId === selectedReleaseId) {
        selectedRelease = {
          ...release,
          previousReleaseId: index > 0 ? convertToUrlFriendlyString(`${releases[index-1].artistName} ${releases[index-1].title}`) : null,
          nextReleaseId: index < releases.length-1 ? convertToUrlFriendlyString(`${releases[index+1].artistName} ${releases[index+1].title}`) : null
        }
      }
    });
    return selectedRelease;
  }

  render() {
    const selectedReleaseId = this.props.match && this.props.match.params && this.props.match.params.releaseId
      ? this.props.match.params.releaseId
      : null;
    const selectedRelease = selectedReleaseId ? this.getSelectedRelease(selectedReleaseId, this.props.selectedLanguageKey) : null;

    const listPage = {
      title: {
        en: 'Portfolio | Dehli Musikk',
        no: 'Portefølje | Dehli Musikk'
      },
      heading: {
        en: 'Portfolio',
        no: 'Portefølje'
      },
      description: {
        en: 'Recordings where Dehli Musikk has contributed',
        no: 'Utgivelser Dehli Musikk har bidratt på'
      }
    }

    const detailsPage = {
      title: {
        en: `${selectedRelease ? `${selectedRelease.title} by ${selectedRelease.artistName}` : ''} - Portfolio | Dehli Musikk`,
        no: `${selectedRelease ? `${selectedRelease.title} av ${selectedRelease.artistName}` : ''} - Portefølje | Dehli Musikk`
      },
      heading: {
        en: selectedRelease ? `${selectedRelease.title} by ${selectedRelease.artistName}` : '',
        no: selectedRelease ? `${selectedRelease.title} av ${selectedRelease.artistName}` : ''
      },
      description: {
        en: selectedRelease ? `Listen to the track ${selectedRelease.title} by ${selectedRelease.artistName}` : '',
        no: selectedRelease ? `Lytt til låta ${selectedRelease.title} av ${selectedRelease.artistName}` : ''
      }
    }

    let breadcrumbs = [
      {
        name: listPage.heading[this.props.selectedLanguageKey],
        path: `/${this.props.getLanguageSlug(this.props.selectedLanguageKey)}portfolio/`
      }
    ];
    if (selectedRelease){
      breadcrumbs.push({
        name: detailsPage.heading[this.props.selectedLanguageKey],
        path: `/${this.props.getLanguageSlug(this.props.selectedLanguageKey)}portfolio/${selectedReleaseId}/`
      })
    }

    if (this.state.redirect) {
      return <Redirect to={this.state.redirect}/>;
    }
    else {

      const metaTitle = selectedRelease ? detailsPage.title[this.props.selectedLanguageKey] : listPage.title[this.props.selectedLanguageKey];
      const contentTitle = selectedRelease ? detailsPage.heading[this.props.selectedLanguageKey] : listPage.heading[this.props.selectedLanguageKey];
      const metaDescription = selectedRelease ? detailsPage.description[this.props.selectedLanguageKey] : listPage.description[this.props.selectedLanguageKey];

      return (<React.Fragment>
        <Helmet htmlAttributes={{ lang : this.props.selectedLanguageKey }}>
          <title>{metaTitle}</title>
          <meta name='description' content={metaDescription} />
          <link rel="canonical" href={`https://www.dehlimusikk.no/${this.props.getLanguageSlug(this.props.selectedLanguageKey)}portfolio/${selectedRelease ? selectedReleaseId + '/' : ''}`}/>
          <link rel="alternate" href={`https://www.dehlimusikk.no/portfolio/${selectedRelease ? selectedReleaseId + '/' : ''}`} hreflang="no"/>
          <link rel="alternate" href={`https://www.dehlimusikk.no/en/portfolio/${selectedRelease ? selectedReleaseId + '/' : ''}`} hreflang="en"/>
          <link rel="alternate" href={`https://www.dehlimusikk.no/portfolio/${selectedRelease ? selectedReleaseId + '/' : ''}`} hreflang="x-default"/>
          <meta property="og:title" content={contentTitle} />
          <meta property="og:url" content={`https://www.dehlimusikk.no/${this.props.getLanguageSlug(this.props.selectedLanguageKey)}portfolio/${selectedRelease ? selectedReleaseId + '/' : ''}`} />
          <meta property="og:description" content={metaDescription} />
          <meta property="og:locale" content={this.props.selectedLanguageKey === 'en' ? 'en_US' : 'no_NO'} />
          <meta property="og:locale:alternate" content={this.props.selectedLanguageKey === 'en' ? 'nb_NO' : 'en_US'} />
          <meta property="twitter:title" content={contentTitle} />
          <meta property="twitter:description" content={metaDescription} />
        </Helmet>
        {selectedRelease ? this.renderSelectedRelease(selectedRelease) : ''}
        <Container blur={selectedRelease !== null}>
          <Breadcrumbs breadcrumbs={breadcrumbs} />
          <h1>{contentTitle}</h1>
          <p>{this.props.selectedLanguageKey === 'en' ? 'Recordings where I\'ve contributed' : 'Utgivelser jeg har bidratt på'}</p>
        </Container>
        <Container blur={selectedRelease !== null}>
          <List>
             {this.renderReleases()}
          </List>
        </Container>
      </React.Fragment>)
    }
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

export default connect(mapStateToProps, mapDispatchToProps)(Portfolio);
