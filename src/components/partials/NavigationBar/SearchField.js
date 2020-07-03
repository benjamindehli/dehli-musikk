// Dependencies
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {Redirect} from 'react-router-dom';

// Actions
import {getLanguageSlug} from 'actions/LanguageActions';
import {updateSearchResults} from 'actions/SearchResultsActions';

// Helpers
import {getSearchResults} from 'helpers/search';

// Stylesheets
import style from 'components/partials/NavigationBar/SearchField.module.scss';

class SearchField extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showResultsList: false,
      results: null,
      redirect: null
    };
    this.setResultsListWrapperRef = this.setResultsListWrapperRef.bind(this);
    this.handleClickOutsideResultsList = this.handleClickOutsideResultsList.bind(this);
  }

  componentDidMount() {
    document.addEventListener('mousedown', this.handleClickOutsideResultsList);
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.handleClickOutsideResultsList);
  }

  componentDidUpdate(prevProps){
    if (this.state.redirect) {
      this.setState({redirect: null});
    }
  }

  setResultsListWrapperRef(node) {
    this.resultsListWrapperRef = node;
  }

  renderReleaseThumbnail(thumbnailPaths, alt) {
    return (<picture>
      <source sizes='55' srcSet={`${thumbnailPaths.webp} 55w`} type="image/webp"/>
      <source sizes='55' srcSet={`${thumbnailPaths.jpg} 55w`} type="image/jpg"/>
      <img src={thumbnailPaths.jpg} width='55' height='55' alt={alt}/>
    </picture>);
  }

  handleSubmitSearch(event){
    console.log(event.key);
    if (event.key === 'Enter'){
      let searchString = event.target.value.replace(/[^a-å0-9- ]+/ig, ""); // Removes unwanted characters
      searchString = searchString.replace(/\s\s+/g, ' '); // Remove redundant whitespace
      this.setState({
          redirect: `/${this.props.getLanguageSlug(this.props.selectedLanguageKey)}search/?q=${searchString}`,
          showResultsList: false
        });
    }
  }

  handleShowResultsList(event) {
    const searchResults = getSearchResults(event.target.value, this.props.selectedLanguageKey);
    if (searchResults) {
      this.setState({
        showResultsList: true,
        results: searchResults
      });
    } else {
      this.hideResultsList();
    }
  }

  handleClickOutsideResultsList(event) {
    if (this.resultsListWrapperRef && !this.resultsListWrapperRef.contains(event.target) && this.state.showResultsList) {
      this.hideResultsList();
    }
  }

  hideResultsList() {
    this.setState({showResultsList: false});
  }

  renderResultsList(results, selectedLanguageKey) {
    if (results && results.length) {
      const itemTypeIcons = {
        post: ['fas', 'photo-video'],
        product: ['fas', 'shopping-cart'],
        release: ['fas', 'music'],
        instruments: ['fas', 'guitar'],
        amplifiers: ['fas', 'bullhorn'],
        effects: ['fas', 'sliders-h']
      };
      const resultsElements = results.map((result, resultKey) => {
        return (<a href={result.link} title={result.linkTitle} key={resultKey} className={style.resultsListItem}>
          {result.thumbnailPaths && result.thumbnailDescription ? this.renderReleaseThumbnail(result.thumbnailPaths, result.thumbnailDescription) : ''}
          <span className={style.resultsListItemText}>{result.text}</span>
          <span className={`${style.resultsListItemTypeLabel} ${style[result.type]}`}><span><FontAwesomeIcon icon={itemTypeIcons[result.type]}/> {result.label}</span></span>
        </a>)
      });
      return resultsElements;
    } else {
      return (<span className={style.resultsListItem}>{selectedLanguageKey === 'en' ? 'No results' : 'Ingen resultat'}</span>);
    }
  }

  render() {
    if (this.state.redirect) {
      return <Redirect to={this.state.redirect}/>;
    } else {
      return (<React.Fragment>
        <div className={style.searchFieldContainer}>
          <FontAwesomeIcon icon={['fas', 'search']}/>
          <label htmlFor="search" className={style.hidden}>{this.props.selectedLanguageKey === 'en' ? 'Search' : 'Søk'}</label>
          <input type="search"
                 autoComplete="off"
                 id="search"
                 onChange={(event) => this.handleShowResultsList(event)}
                 onKeyUp={(event) => this.handleSubmitSearch(event)}
                 placeholder={this.props.selectedLanguageKey === 'en' ? 'Search' : 'Søk'}
                 className={style.searchField} />
        </div>
        <div className={`${style.resultsListContainer} ${this.state.showResultsList
            ? style.active
            : ''}`}>
          <div ref={this.setResultsListWrapperRef} className={style.resultsList}>
            {this.renderResultsList(this.state.results, this.props.selectedLanguageKey)}
          </div>
        </div>
      </React.Fragment>)
    }
  }
}

const mapStateToProps = state => ({
  selectedLanguageKey: state.selectedLanguageKey,
  location: state.router.location
});

const mapDispatchToProps = {
  getLanguageSlug,
  updateSearchResults
};

export default connect(mapStateToProps, mapDispatchToProps)(SearchField);
