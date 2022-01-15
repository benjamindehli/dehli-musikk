// Dependencies
import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

// Selectors
import { getLanguageSlug } from 'reducers/AvailableLanguagesReducer';

// Stylesheets
import style from 'components/partials/Breadcrumbs.module.scss';

const Breadcrumbs = ({ breadcrumbs = [] }) => {

  // Redux store
  const languageSlug = useSelector(state => getLanguageSlug(state));

  const renderBreadcrumbJsonLd = (breadcrumbs) => {
    const originUrl = 'https://www.dehlimusikk.no';
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "item": `${originUrl}/${languageSlug}`,
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

  const renderBreadcrumbListElements = (breadcrumbs) => {
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

  return (<React.Fragment>
    <Helmet>
      <script type="application/ld+json">
        {renderBreadcrumbJsonLd(breadcrumbs)}
      </script>
    </Helmet>
    <div className={style.breadcrumbs}>
      <ul>
        <li>
          <Link to={`/${languageSlug}`} title='Dehli Musikk'>Dehli Musikk</Link>
        </li>
        {renderBreadcrumbListElements(breadcrumbs)}
      </ul>
    </div>
  </React.Fragment>);
}

export default Breadcrumbs;
