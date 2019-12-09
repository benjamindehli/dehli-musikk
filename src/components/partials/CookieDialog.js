// Dependencies
import React from 'react';
import {Link} from 'react-router-dom';
import {connect} from 'react-redux';

// Components
import Button from './Button';
import CookiesInUseNorwegian from './Policies/CookiesInUseNorwegian';
import CookiePolicyEnglish from './Policies/CookiePolicyEnglish';

// Actions
import {updateHasAcceptedPolicy} from '../../actions/PolicyActions';
import { getLanguageSlug } from '../../actions/LanguageActions';


// Stylesheets
import style from './CookieDialog.module.scss';

class CookieDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showDetails: false,
      activeTab: 'cookiesInUse'
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.location.pathname !== this.props.location.pathname) {
      if (this.state.showDetails) {
        this.setState({showDetails: false});
      }
    }
  }

  handleToggleDetailsClick() {
    this.setState({
      showDetails: !this.state.showDetails
    });
  }

  handleAcceptPolicyClick() {
    localStorage.setItem("hasAcceptedPolicy", true);
    this.props.updateHasAcceptedPolicy(true);
  }

  handleTabClick(tabId) {
    this.setState({activeTab: tabId});
  }

  renderActiveTabContent() {
    if (this.state.activeTab === 'cookiesInUse') {
      return <CookiesInUseNorwegian/>;
    } else if (this.state.activeTab === 'cookiePolicy') {
      return (<div className='padding'>
        <p>This is the Cookie Policy for Dehli Musikk, accessible from <Link to={`/${this.props.getLanguageSlug(this.props.selectedLanguageKey)}cookie-policy`}>https://www.dehlimusikk.no/{this.props.getLanguageSlug(this.props.selectedLanguageKey)}cookie-policy</Link></p>
        <CookiePolicyEnglish/>
      </div>);
    } else {
      return '';
    }
  }

  renderDetails() {
    return (<div className={style.details}>
      <div className={`${style.tabs} ${this.state.showDetails
          ? style.visible
          : ''}`}>
        <span onClick={() => this.handleTabClick('cookiesInUse')} className={`${style.tab} ${this.state.activeTab === 'cookiesInUse'
            ? style.active
            : ''}`}>
          Cookies in use
        </span>
        <span onClick={() => this.handleTabClick('cookiePolicy')} className={`${style.tab} ${this.state.activeTab === 'cookiePolicy'
            ? style.active
            : ''}`}>
          Cookie policy
        </span>
      </div>
      <div className={`${style.detailsBody} ${this.state.showDetails
          ? style.open
          : ''}`}>
        {this.renderActiveTabContent()}
      </div>
    </div>);
  }
  render() {
    return this.props.hasAcceptedPolicy && this.props.hasAcceptedPolicy !== 'false'
      ? ''
      : (<React.Fragment>
        <div className={style.cookieDialogHeightElement}></div>
        <div className={style.cookieDialog}>
          <div className='padding'>
            <h2>
              {
                this.props.selectedLanguageKey === 'en'
                  ? 'This website uses cookies'
                  : 'Nettstedet bruker cookies'
              }</h2>

            <div className={style.dialogContent}>
              <div className={style.dialogContentText}>
                <p>
                  {
                    this.props.selectedLanguageKey === 'en'
                      ? 'The cookies are used for statistics to improve your experience. By clicking OK, you agree to the use of cookies.'
                      : 'Disse brukes til statistikk for å forbedre brukeropplevelsen. Ved å klikke "OK" godtar du bruken av cookies.'
                  }
                </p>
              </div>
              <div>
                <Button buttontype='minimal' onClick={() => this.handleToggleDetailsClick()}>{
                    this.state.showDetails
                      ? `${this.props.selectedLanguageKey === 'en' ? 'Hide details' : 'Skjul detaljer'}`
                      : `${this.props.selectedLanguageKey === 'en' ? 'Details' : 'Detaljer'}`
                  }</Button>
              </div>
              <div>
                <Button onClick={() => this.handleAcceptPolicyClick()}>OK</Button>
              </div>
            </div>
          </div>
          {this.renderDetails()}
        </div>
      </React.Fragment>)
  }
};

const mapStateToProps = state => ({hasAcceptedPolicy: state.hasAcceptedPolicy, location: state.router.location, selectedLanguageKey: state.selectedLanguageKey});

const mapDispatchToProps = {
  updateHasAcceptedPolicy,
  getLanguageSlug
};

export default connect(mapStateToProps, mapDispatchToProps)(CookieDialog);
