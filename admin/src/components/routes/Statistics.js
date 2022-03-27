// Dependencies
import React, { Component } from 'react';
import { connect } from 'react-redux';


// Helpers
import { fetchReleaseData } from 'helpers/releaseHelpers';
import { getReleasesInstrumentsWithInstrument } from 'helpers/releaseInstrumentHelpers';

// Stylesheets
import style from 'components/routes/Dashboard.module.scss';

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
        {instrument.brand} {instrument.model} ({releasesInstrument.length})
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
