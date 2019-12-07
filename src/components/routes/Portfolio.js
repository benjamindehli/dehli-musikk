// Dependencies
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {Helmet} from 'react-helmet';

// Components
import {withFirebase} from '../Firebase';
import Artist from '../partials/Portfolio/Artist';

// Actions
import { getLanguageSlug, updateMultilingualRoutes } from '../../actions/LanguageActions';

// Stylesheets
import style from './Portfolio.module.scss';

// Data
import releases from '../../data/portfolio';

class Portfolio extends Component {
  constructor(props) {
    super(props);
    this.state = {
      viewType: 'list',
      artists: null,
      releases: {},
      isMobile: false,
      selectedLanguageKey: this.props.match && this.props.match.params && this.props.match.params.selectedLanguage ? this.props.match.params.selectedLanguage : ''
    };
  }

  componentDidMount() {
    this.props.updateMultilingualRoutes('portfolio');
    this.props.firebase.getArtists().then(artists => {
      this.setState({artists: artists});
    });
      this.setState({
        isMobile: window.innerWidth < 816
      });
  }

  changeViewType(viewType) {
    this.setState({viewType: viewType});
  }

  renderArtists() {
    return this.state.artists && this.state.artists.length
      ? this.state.artists.map((artist, key) => {
        return <Artist key={artist.id} artist={artist} viewType={this.state.viewType}/>;
      })
      : '';
  }

  renderViewTypeButton(selectedViewType) {
    return selectedViewType === 'list'
      ? (<button onClick={() => this.changeViewType('grid')} className={style.viewTypeButton}>
        <FontAwesomeIcon icon={['fas', 'grip-horizontal']}/>
        Show as grid
      </button>)
      : (<button onClick={(event) => this.changeViewType('list')} className={style.viewTypeButton}>
        <FontAwesomeIcon icon={['fas', 'list-ul']}/>
        Show as list
      </button>)
  }

  render() {
    return (<div className={style.container}>
      <Helmet>
        <link rel="canonical" href={`https://www.dehlimusikk.no/${this.props.getLanguageSlug(this.state.selectedLanguageKey)}portfolio`} />
        <link rel="alternate" href="https://www.dehlimusikk.no/portfolio" hreflang="no" />
        <link rel="alternate" href="https://www.dehlimusikk.no/en/portfolio" hreflang="en" />
        <link rel="alternate" href="https://www.dehlimusikk.no/portfolio" hreflang="x-default" />
      </Helmet>
      <div className='padding'>
        <h1>Portfolio</h1>
        {!this.state.isMobile ? this.renderViewTypeButton(this.state.viewType) : ''}
      </div>
      <div className={`${style.releases} padding-sm`}>
        <div className={style[this.state.viewType]}>
          {this.renderArtists()}
        </div>
      </div>
    </div>)
  }
}

const mapStateToProps = null;

const mapDispatchToProps = {
  getLanguageSlug,
  updateMultilingualRoutes
};

export default connect(mapStateToProps, mapDispatchToProps)(withFirebase(Portfolio));
