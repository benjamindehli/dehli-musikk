// Dependencies
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';

// Components
import {withFirebase} from '../Firebase';
import Artist from '../partials/Portfolio/Artist';

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
      releases: {}
    };
  }

  componentDidMount() {
    this.props.firebase.getArtists().then(artists => {
      this.setState({artists: artists});
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
      <h1>Portfolio</h1>
      {this.renderViewTypeButton(this.state.viewType)}
      <div className={style.releases}>
        <div className={style[this.state.viewType]}>
          {this.renderArtists()}
        </div>
      </div>
    </div>)
  }
}

const mapStateToProps = null;

const mapDispatchToProps = null;

export default connect(mapStateToProps, mapDispatchToProps)(withFirebase(Portfolio));
