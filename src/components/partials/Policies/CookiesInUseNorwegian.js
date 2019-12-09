// Dependencies
import React, {Component} from 'react';
import {connect} from 'react-redux';

// Stylesheets
import style from './Policies.module.scss';

class CookiesInUseNorwegian extends Component {
  render() {
    return (<div>
      <div className={style.table}>
        <div className={style.tableRow}>
          <div>
            <span className={style.tableDataLabel}>Navn:</span>_ga</div>
          <div>
            <span className={style.tableDataLabel}>Leverandør:</span>.dehlimusikk.no</div>
          <div>
            <span className={style.tableDataLabel}>Formål:</span>Samler informasjon om brukerne og deres aktivitet på nettstedet for analyse og rapporteringsformål.</div>
          <div>
            <span className={style.tableDataLabel}>Utløpsdato:</span>2 år</div>
          <div>
            <span className={style.tableDataLabel}>Databehandlingsansvarlig:</span>Google Analytics</div>
          <div>
            <span className={style.tableDataLabel}>Personvernregler for databehandling:</span>https://policies.google.com/technologies/partner-sites?hl=en</div>
        </div>
        <div className={style.tableRow}>
          <div>
            <span className={style.tableDataLabel}>Navn:</span>_ga_B0SKLEBG8E</div>
          <div>
            <span className={style.tableDataLabel}>Leverandør:</span>.dehlimusikk.no</div>
          <div>
            <span className={style.tableDataLabel}>Formål:</span>Samler informasjon om brukerne og deres aktivitet på nettstedet for analyse og rapporteringsformål.</div>
          <div>
            <span className={style.tableDataLabel}>Utløpsdato:</span>2 år</div>
          <div>
            <span className={style.tableDataLabel}>Databehandlingsansvarlig:</span>Google Analytics</div>
          <div>
            <span className={style.tableDataLabel}>Personvernregler for databehandling:</span>https://policies.google.com/technologies/partner-sites?hl=en</div>
        </div>
      </div>

    </div>)
  }

}

const mapStateToProps = null;

const mapDispatchToProps = null;

export default connect(mapStateToProps, mapDispatchToProps)(CookiesInUseNorwegian);
