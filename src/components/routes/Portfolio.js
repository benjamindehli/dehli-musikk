// Dependencies
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {Helmet} from 'react-helmet-async';

// Components
import {withFirebase} from '../Firebase';
import Artist from '../partials/Portfolio/Artist';

// Actions
import { getLanguageSlug, updateMultilingualRoutes, updateSelectedLanguageKey } from '../../actions/LanguageActions';

// Stylesheets
import style from './Portfolio.module.scss';

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
    this.props.updateMultilingualRoutes('portfolio');
    const selectedLanguageKey = this.props.match && this.props.match.params && this.props.match.params.selectedLanguage ? this.props.match.params.selectedLanguage : 'no';
    if (selectedLanguageKey !== this.props.selectedLanguageKey){
      this.props.updateSelectedLanguageKey(selectedLanguageKey);
    }
  }

  componentDidMount() {
    this.initLanguage();
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
        <title>Portfolio - Dehli Musikk</title>
        <link rel="canonical" href={`${window.location.origin}/${this.props.getLanguageSlug(this.props.selectedLanguageKey)}portfolio`} />
        <link rel="alternate" href={`${window.location.origin}/portfolio`} hreflang="no" />
        <link rel="alternate" href={`${window.location.origin}/en/portfolio`} hreflang="en" />
        <link rel="alternate" href={`${window.location.origin}/portfolio`} hreflang="x-default" />
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

const mapStateToProps = state => ({
  selectedLanguageKey: state.selectedLanguageKey
});

const mapDispatchToProps = {
  getLanguageSlug,
  updateMultilingualRoutes,
  updateSelectedLanguageKey
};

export default connect(mapStateToProps, mapDispatchToProps)(withFirebase(Portfolio));
