// Dependencies
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Helmet } from 'react-helmet';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// Components
import ActionButtonBar from 'components/partials/ActionButtonBar';
import Release from 'components/partials/Release';

// Helpers
import { fetchReleaseData } from 'helpers/releaseHelpers';
import { getReleasesInstrumentsWithInstrument } from 'helpers/releaseInstrumentHelpers';

// Stylesheets
import style from 'components/routes/Dashboard.module.scss';
import commonStyle from 'components/partials/commonStyle.module.scss';

class Statistics extends Component {
  constructor(props) {
    super(props);
    this.state = {
      releases: null
    }
  }

  componentDidMount() {
    this.setState({
      releases: this.props.releases
    });
  }


  handleFetchReleaseData(index) {
    const releaseId = this.state.releases[index].id;
    fetchReleaseData(releaseId).then(releaseData => {
      let newReleaseses = this.state.releases;
      newReleaseses[index] = releaseData;
      this.setState({
        releases: newReleaseses
      })
    });
  }


  renderInstrumentsList(releasesInstruments, instruments) {
    const instrumentListElements = instruments.items.map(instrument => {
      const releasesInstrument = getReleasesInstrumentsWithInstrument(releasesInstruments, instrument);
      return (<li key={`${instrument.brand}-${instrument.model}`}>
        <a href="">{instrument.brand} {instrument.model} ({releasesInstrument.length})</a>
      </li>)
    });
    return (
      <ul>
        {instrumentListElements}
      </ul>
    )
  }


  render() {
    return (
      <div className={style.contentSection}>
        <Helmet>
          <title>Statistics - Dashboard - Dehli Musikk</title>
        </Helmet>
        <h1>Statistics</h1>
        {this.renderInstrumentsList(this.props.releasesInstruments, this.props.instruments)}

        equipmentId
      </div>
    )
  }
}

const mapStateToProps = state => ({
  instruments: state.instruments,
  releasesInstruments: state.releasesInstruments
});

const mapDispatchToProps = {
};

export default connect(mapStateToProps, mapDispatchToProps)(Statistics);
