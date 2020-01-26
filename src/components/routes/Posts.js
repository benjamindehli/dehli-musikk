// Dependencies
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Helmet} from 'react-helmet';

// Components
import Post from '../partials/Post';
import Breadcrumbs from '../partials/Breadcrumbs';

// Actions
import {getLanguageSlug, updateMultilingualRoutes, updateSelectedLanguageKey} from '../../actions/LanguageActions';

// Data
import {allPosts} from '../../data/posts';

// Stylesheets
import style from './Posts.module.scss';

class Portfolio extends Component {

  initLanguage() {
    this.props.updateMultilingualRoutes('posts');
    const selectedLanguageKey = this.props.match && this.props.match.params && this.props.match.params.selectedLanguage
      ? this.props.match.params.selectedLanguage
      : 'no';
    if (selectedLanguageKey !== this.props.selectedLanguageKey) {
      this.props.updateSelectedLanguageKey(selectedLanguageKey);
    }
  }

  componentDidMount() {
    this.initLanguage();
  }

  renderPosts() {
    return allPosts && allPosts.length
      ? allPosts.map(post => {
        return <Post key={post.id} post={post}/>
      })
      : '';
  }

  render() {
    const pageTitle = this.props.selectedLanguageKey === 'en'
      ? 'Posts'
      : 'Innlegg';
    const breadcrumbs = [
      {
        name: pageTitle,
        path: `/${this.props.getLanguageSlug(this.props.selectedLanguageKey)}posts`
      }
    ];
    return (<div className={style.container}>
      <Helmet>
        <title>{pageTitle} - Dehli Musikk</title>
        <meta name='description' content={this.props.selectedLanguageKey === 'en'
            ? 'Latest update from Dehli Musikk'
            : 'Siste oppdateringer fra Dehli Musikk'}/>
        <link rel="canonical" href={`https://www.dehlimusikk.no/${this.props.getLanguageSlug(this.props.selectedLanguageKey)}posts`}/>
        <link rel="alternate" href={`https://www.dehlimusikk.no/posts`} hreflang="no"/>
        <link rel="alternate" href={`https://www.dehlimusikk.no/en/posts`} hreflang="en"/>
        <link rel="alternate" href={`https://www.dehlimusikk.no/posts`} hreflang="x-default"/>
      </Helmet>
      <div className='padding'>
        <Breadcrumbs breadcrumbs={breadcrumbs}/>
        <h1>{pageTitle}</h1>
        <p>{
            this.props.selectedLanguageKey === 'en'
              ? 'Updates from Dehli Musikk'
              : 'Oppdateringer fra Dehli Musikk'
          }</p>
      </div>
      <div className={`${style.posts} padding-sm`}>
        <div className={style.grid}>
          {this.renderPosts()}
        </div>
      </div>
    </div>)
  }
}

const mapStateToProps = state => ({selectedLanguageKey: state.selectedLanguageKey});

const mapDispatchToProps = {
  getLanguageSlug,
  updateMultilingualRoutes,
  updateSelectedLanguageKey
};

export default connect(mapStateToProps, mapDispatchToProps)(Portfolio);
