// Dependencies
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Helmet} from 'react-helmet';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {Redirect} from 'react-router-dom';

// Components
import Breadcrumbs from 'components/partials/Breadcrumbs';
import Container from 'components/template/Container';
import List from 'components/template/List';
import ListItem from 'components/template/List/ListItem';
import SearchResult from 'components/partials/SearchResult';

// Actions
import {getLanguageSlug, updateMultilingualRoutes, updateSelectedLanguageKey} from 'actions/LanguageActions';
import {updateSearchResults, updateSearchResultsCount} from 'actions/SearchResultsActions';

// Helpers
import {getSearchResults} from 'helpers/search';

// Stylesheets
import style from 'components/routes/Search.module.scss';


class Search extends Component {

  constructor(props) {
    super(props);
    this.state = {
      redirect: null,
      searchQuery: this.props.location && this.props.location.query && this.props.location.query.q ? this.props.location.query.q : null,
      searchCategory: this.props.location && this.props.location.query && this.props.location.query.category ? this.props.location.query.category : 'all',
      searchCategoryNames: {
        all: {
          en: 'Show all',
          no: 'Vis alle'
        },
        release: {
          en: 'Releases',
          no: 'Utgivelser'
        },
        post: {
          en: 'Posts',
          no: 'Innlegg'
        },
        video: {
          en: 'Videos',
          no: 'Videoer'
        },
        product: {
          en: 'Products',
          no: 'Produkter'
        },
        instruments: {
          en: 'Instruments',
          no: 'Instrumenter'
        },
        effects: {
          en: 'Effects',
          no: 'Effekter'
        },
        amplifiers: {
          en: 'Amplifiers',
          no: 'Forsterkere'
        }
      },
      selectedLanguageKey: this.props.match && this.props.match.params && this.props.match.params.selectedLanguage && this.props.match.params.selectedLanguage === 'en' ? 'en' : 'no'
    };
  }

  initLanguage() {
    const searchQuery = this.props.location && this.props.location.query && this.props.location.query.q ? this.props.location.query.q : null;
    const searchCategory = this.props.location && this.props.location.query && this.props.location.query.category ? this.props.location.query.category : null;
    this.props.updateMultilingualRoutes(
      searchQuery
      ? searchCategory
        ? `search/?q=${searchQuery}&category=${searchCategory}`
        : `search/?q=${searchQuery}`
      : 'search/');

    this.props.updateSelectedLanguageKey(this.state.selectedLanguageKey);
  }

  componentDidMount() {
    this.initLanguage();
    const searchQuery = this.state.searchQuery;
    const searchCategory = this.state.searchCategory;
    if (searchQuery){
      const searchResults = getSearchResults(searchQuery, this.state.selectedLanguageKey, searchCategory);
      this.props.updateSearchResults(searchResults);
      if (this.state.searchCategory === 'all'){
        this.props.updateSearchResultsCount(searchResults);
      }
    }
  }

  componentDidUpdate(prevProps) {
    if (this.state.redirect) {
      this.setState({redirect: null});
    }
    if (this.props.location.pathname !== prevProps.location.pathname){
      this.initLanguage();
    }
    const prevSearchQuery = prevProps.location && prevProps.location.query && prevProps.location.query.q ? prevProps.location.query.q : null;
    const searchQuery = this.props.location && this.props.location.query && this.props.location.query.q ? this.props.location.query.q : null;
    const prevSearchCategory = prevProps.location && prevProps.location.query && prevProps.location.query.category ? prevProps.location.query.category : 'all';
    const searchCategory = this.props.location && this.props.location.query && this.props.location.query.category ? this.props.location.query.category : 'all';
    if (prevSearchQuery !== searchQuery || prevSearchCategory !== searchCategory) {
      this.setState({
        searchQuery,
        searchCategory
      },() => {
        const searchResults = getSearchResults(searchQuery, this.props.selectedLanguageKey, this.state.searchCategory);
        this.props.updateSearchResults(searchResults);
        if (this.state.searchCategory === 'all'){
          this.props.updateSearchResultsCount(searchResults);
        }
        this.initLanguage()
      })

    }
  }

  renderSearchResults(searchResults) {
    return searchResults.map((searchResult, index) => {
      return (<ListItem compact={true} key={index}>
        <SearchResult searchResult={searchResult} />
      </ListItem>);
    })
  }

  renderSearchCategoryOptions(searchCategoryNames, searchResultsCount){
    return Object.keys(searchCategoryNames).map(categoryKey => {
      const category = searchCategoryNames[categoryKey];
      const hasSearchResultsCount = Object.keys(searchResultsCount).length;
      const count = searchResultsCount[categoryKey] ? searchResultsCount[categoryKey] : 0;
      const isDisabled = hasSearchResultsCount && !count;
      return <option value={categoryKey} disabled={isDisabled} key={categoryKey}>{category[this.state.selectedLanguageKey]}{hasSearchResultsCount ? ` (${count})` : ''}</option>
    })
  }

  handleSearchCategoryChange(value){
    const urlParameters = value !== 'all'
        ? `?q=${this.state.searchQuery}&category=${value}`
        : `?q=${this.state.searchQuery}`
    this.setState({
      redirect: `/${this.props.getLanguageSlug(this.props.selectedLanguageKey)}search/${urlParameters}`
    })
  }

  getMetaDescriptionFromSearchresults(searchResults, description = ''){
    if (searchResults && searchResults.length) {
      searchResults.forEach(result => {
        if (description.length < 160){
          description += `${result.text}${result.excerpt ? ' ' + result.excerpt + ', ' : ', '}`;
        }
      });
    }
    return description.length > 160 ? `${description.substring(0, 160)}` : description;;
  }


  render() {
    const hasSearchResultsCount = this.props.searchResultsCount && Object.keys(this.props.searchResultsCount).length;
    const searchQuery = this.state.searchQuery;
    const searchCategory = this.state.searchCategory;
    const urlParameters = searchQuery
      ? searchCategory !== 'all'
        ? `?q=${searchQuery}&category=${searchCategory}`
        : `?q=${searchQuery}`
      : '';

    const listPage = {
      title: {
        en: searchCategory !== 'all'
          ? `Results for ${this.state.searchCategoryNames[searchCategory]['en'].toLowerCase()} with the search term "${searchQuery}" | Dehli Musikk`
          : `All results with the search term "${searchQuery}" | Dehli Musikk`,
        no: searchCategory !== 'all'
          ? `Resultat for ${this.state.searchCategoryNames[searchCategory]['no'].toLowerCase()} med søkeordet "${searchQuery}" | Dehli Musikk`
          : `Alle resultater med søkeordet "${searchQuery}" | Dehli Musikk`
      },
      heading: {
        en: searchCategory !== 'all'
          ? `Results for ${this.state.searchCategoryNames[searchCategory]['en'].toLowerCase()} with the search term "${searchQuery}"`
          : `All results with the search term "${searchQuery}"`,
        no: searchCategory !== 'all'
          ? `Resultat for ${this.state.searchCategoryNames[searchCategory]['no'].toLowerCase()} med søkeordet "${searchQuery}"`
          : `Alle resultater med søkeordet "${searchQuery}"`
      },
      description: {
        en: searchCategory !== 'all'
          ? this.getMetaDescriptionFromSearchresults(this.props.searchResults, `Results for ${this.state.searchCategoryNames[searchCategory]['en'].toLowerCase()} with the search term "${searchQuery}": `)
          : this.getMetaDescriptionFromSearchresults(this.props.searchResults, `Results with the search term "${searchQuery}": `),
        no: searchCategory !== 'all'
          ? this.getMetaDescriptionFromSearchresults(this.props.searchResults, `Resultat for ${this.state.searchCategoryNames[searchCategory]['no'].toLowerCase()} med søkeordet "${searchQuery}": `)
          : this.getMetaDescriptionFromSearchresults(this.props.searchResults, `Resultater med søkeordet "${searchQuery}": `)
      }
    }

    let breadcrumbs = [
      {
        name: listPage.heading[this.props.selectedLanguageKey],
        path: `/${this.props.getLanguageSlug(this.props.selectedLanguageKey)}search/${urlParameters}`
      }
    ];


      const metaTitle = listPage.title[this.props.selectedLanguageKey];
      const contentTitle = listPage.heading[this.props.selectedLanguageKey];
      const metaDescription = listPage.description[this.props.selectedLanguageKey];
      if (this.state.redirect) {
        return <Redirect to={this.state.redirect}/>;
      } else {
        return (<React.Fragment>
          <Helmet htmlAttributes={{
              lang: this.props.selectedLanguageKey
            }}>
            <title>{metaTitle}</title>
            <meta name='description' content={metaDescription}/>
            <link rel="canonical" href={`https://www.dehlimusikk.no/${this.props.getLanguageSlug(this.props.selectedLanguageKey)}search/${urlParameters}`}/>
            <link rel="alternate" href={`https://www.dehlimusikk.no/search/${urlParameters}`} hreflang="no"/>
            <link rel="alternate" href={`https://www.dehlimusikk.no/en/search/${urlParameters}`} hreflang="en"/>
            <link rel="alternate" href={`https://www.dehlimusikk.no/search/${urlParameters}`} hreflang="x-default"/>
            <meta property="og:title" content={contentTitle}/>
            <meta property="og:url" content={`https://www.dehlimusikk.no/${this.props.getLanguageSlug(this.props.selectedLanguageKey)}search/${urlParameters}`}/>
            <meta property="og:description" content={metaDescription}/>
            <meta property="og:locale" content={this.props.selectedLanguageKey === 'en'
                ? 'en_US'
                : 'no_NO'}/>
            <meta property="og:locale:alternate" content={this.props.selectedLanguageKey === 'en'
                ? 'nb_NO'
                : 'en_US'}/>
            <meta property="twitter:title" content={contentTitle} />
            <meta property="twitter:description" content={metaDescription} />
          </Helmet>
          <Container>
            <Breadcrumbs breadcrumbs={breadcrumbs}/>
            <h1>{contentTitle}</h1>
            <p>{
                this.props.selectedLanguageKey === 'en'
                  ? hasSearchResultsCount
                    ? `Shows ${this.props.searchResults.length} of ${this.props.searchResultsCount.all} results`
                    : `${this.props.searchResults.length} results`
                  : hasSearchResultsCount
                    ? `Viser ${this.props.searchResults.length} av ${this.props.searchResultsCount.all} treff`
                    : `${this.props.searchResults.length} treff`
              }</p>
          </Container>
          <Container>
          <label className={style.selectListLabel} htmlFor="searchCategory">{this.props.selectedLanguageKey === 'en' ? 'Filter results by category' : 'Filtrer resultat på kategori'}</label>
          <div className={style.selectListContainer}>
            <FontAwesomeIcon icon={['fas', 'filter']}/>
            <select id="searchCategory" name="searchCategory" value={this.state.searchCategory} onChange={(event) => this.handleSearchCategoryChange(event.target.value)}>
              {this.renderSearchCategoryOptions(this.state.searchCategoryNames, this.props.searchResultsCount)}
            </select>
            <FontAwesomeIcon icon={['fas', 'chevron-down']}/>
          </div>
          <div className={style.listContainer}>
            <List compact={true}>
              {this.renderSearchResults(this.props.searchResults)}
            </List>
            </div>
          </Container>
        </React.Fragment>)
    }
  }
}


const mapStateToProps = state => ({
  selectedLanguageKey: state.selectedLanguageKey,
  searchResults: state.searchResults,
  searchResultsCount: state.searchResultsCount,
  location: state.router.location
});

const mapDispatchToProps = {
  getLanguageSlug,
  updateMultilingualRoutes,
  updateSelectedLanguageKey,
  updateSearchResults,
  updateSearchResultsCount
};

export default connect(mapStateToProps, mapDispatchToProps)(Search);
