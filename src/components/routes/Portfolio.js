// Dependencies
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {Helmet} from 'react-helmet';

// Components
import Release from 'components/partials/Portfolio/Release';
import Breadcrumbs from 'components/partials/Breadcrumbs';

// Actions
import { getLanguageSlug, updateMultilingualRoutes, updateSelectedLanguageKey } from 'actions/LanguageActions';

// Data
import releases from 'data/portfolio';

// Stylesheets
import style from 'components/routes/Portfolio.module.scss';

class Portfolio extends Component {
  constructor(props) {
    super(props);
    this.state = {
      viewType: 'list',
      artists: null,
      releases: {},
      isMobile: false,
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
    this.setState({
      isMobile: window.innerWidth < 816
    });
  }

  changeViewType(viewType) {
    this.setState({viewType: viewType});
  }

  renderReleases() {
    return releases && releases.length
      ? releases.map(release => {
        const artist = {
          artistName: release.artistName
        }
        return <Release key={release.id} release={release} artist={artist} viewType={this.props.viewType}/>
      })
      : '';
  }

  renderViewTypeButton(selectedViewType) {
    return selectedViewType === 'list'
      ? (<button onClick={() => this.changeViewType('grid')} className={style.viewTypeButton}>
        <FontAwesomeIcon icon={['fas', 'grip-horizontal']}/> {this.props.selectedLanguageKey === 'en' ? 'Show as grid' : 'Rutenettvisning'}
      </button>)
      : (<button onClick={(event) => this.changeViewType('list')} className={style.viewTypeButton}>
        <FontAwesomeIcon icon={['fas', 'list-ul']}/> {this.props.selectedLanguageKey === 'en' ? 'Show as list' : 'Listevisning'}
      </button>)
  }

  render() {
    const metaTitle = `${this.props.selectedLanguageKey === 'en' ? 'Portfolio' : 'Portefølje'} | Dehli Musikk`;
    const contentTitle = this.props.selectedLanguageKey === 'en' ? 'Portfolio' : 'Portefølje';
    const breadcrumbs = [
      {
        name: contentTitle,
        path: `/${this.props.getLanguageSlug(this.props.selectedLanguageKey)}portfolio`
      }
    ];
    const metaDescription = this.props.selectedLanguageKey === 'en' ? 'Recordings where Dehli Musikk has contributed' : 'Utgivelser Dehli Musikk har bidratt på';
    return (<div className={style.container}>
        <Helmet htmlAttributes={{ lang : this.props.selectedLanguageKey }}>
        <title>{metaTitle}</title>
        <meta name='description' content={metaDescription} />
        <link rel="canonical" href={`https://www.dehlimusikk.no/${this.props.getLanguageSlug(this.props.selectedLanguageKey)}portfolio/`} />
        <link rel="alternate" href={`https://www.dehlimusikk.no/portfolio/`} hreflang="no" />
        <link rel="alternate" href={`https://www.dehlimusikk.no/en/portfolio/`} hreflang="en" />
        <link rel="alternate" href={`https://www.dehlimusikk.no/portfolio/`} hreflang="x-default" />
        <meta property="og:title" content={contentTitle} />
        <meta property="og:url" content={`https://www.dehlimusikk.no/${this.props.getLanguageSlug(this.props.selectedLanguageKey)}portfolio/`} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:locale" content={this.props.selectedLanguageKey === 'en' ? 'en_US' : 'no_NO'} />
        <meta property="og:locale:alternate" content={this.props.selectedLanguageKey === 'en' ? 'nb_NO' : 'en_US'} />
      </Helmet>
      <div className='padding'>
      <Breadcrumbs breadcrumbs={breadcrumbs} />
        <h1>{contentTitle}</h1>
        <p>{this.props.selectedLanguageKey === 'en' ? 'Recordings where I\'ve contributed' : 'Utgivelser jeg har bidratt på'}</p>
      </div>
      <div className={`${style.releases} padding-sm`}>
        <div className={style[this.state.viewType]}>
           {this.renderReleases()}
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

export default connect(mapStateToProps, mapDispatchToProps)(Portfolio);

// {!this.state.isMobile ? this.renderViewTypeButton(this.state.viewType) : ''}
