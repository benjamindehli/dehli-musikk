// Dependencies
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router-dom';
import PropTypes from 'prop-types';
import {Helmet} from 'react-helmet';

// Actions
import {getLanguageSlug} from 'actions/LanguageActions';

// Stylesheets
import style from 'components/partials/Breadcrumbs.module.scss';

export class Breadcrumbs extends Component {

  renderBreadcrumbJsonLd(breadcrumbs) {
    const originUrl = 'https://www.dehlimusikk.no';
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "item": `${originUrl}/${this.props.getLanguageSlug(this.props.selectedLanguageKey)}`,
          "name": "Dehli Musikk"
        }
      ]
    }
    breadcrumbs.forEach((breadcrumb, index) => {
      jsonLd.itemListElement.push({
        "@type": "ListItem",
        "position": index + 2,
        "item": `${originUrl}${breadcrumb.path}`,
        "name": breadcrumb.name
      })
    })
    return JSON.stringify(jsonLd);
  }

  renderBreadcrumbListElements(breadcrumbs) {
    return breadcrumbs.map((breadcrumb, key) => {
      return key === breadcrumbs.length - 1
        ? (<li key={key}>
          <span>{breadcrumb.name}</span>
        </li>)
        : (<li key={key}>
          <Link to={breadcrumb.path} title={breadcrumb.name}>{breadcrumb.name}</Link>
        </li>);
    })
  }

  render() {
    return (<React.Fragment>
      <Helmet>
        <script type="application/ld+json">
          {this.renderBreadcrumbJsonLd(this.props.breadcrumbs)}
        </script>
      </Helmet>
      <div className={style.breadcrumbs}>
        <ul>
          <li>
            <Link to={`/${this.props.getLanguageSlug(this.props.selectedLanguageKey)}`} title='Dehli Musikk'>Dehli Musikk</Link>
          </li>
          {this.renderBreadcrumbListElements(this.props.breadcrumbs)}
        </ul>
      </div>
    </React.Fragment>);
  }
}

Breadcrumbs.propTypes = {
  breadcrumbs: PropTypes.array
};

Breadcrumbs.defaultProps = {
  breadcrumbs: []
};

const mapStateToProps = state => ({selectedLanguageKey: state.selectedLanguageKey});

const mapDispatchToProps = {
  getLanguageSlug
};

export default connect(mapStateToProps, mapDispatchToProps)(Breadcrumbs);
