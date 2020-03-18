// Dependencies
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Link, NavLink} from 'react-router-dom';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';

// Actions
import {getLanguageSlug} from 'actions/LanguageActions';

// Helpers
import {convertToUrlFriendlyString} from 'helpers/urlFormatter'

// Stylesheets
import style from 'components/partials/NavigationBar/SearchField.module.scss';

// Data
import releases from 'data/portfolio';
import {allPosts} from 'data/posts';

class SearchField extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showResultsList: false,
      results: null
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

  }

  setResultsListWrapperRef(node) {
    this.resultsListWrapperRef = node;
  }

  getSearchPointsFromRelease(release, searchString){
    const selectedLanguageKey = this.props.selectedLanguageKey;

    const id = convertToUrlFriendlyString(`${release.artistName} ${release.title}`);
    const link = `/${this.props.getLanguageSlug(selectedLanguageKey)}portfolio/${id}/`;
    const linkTitle = `${selectedLanguageKey === 'en' ? 'Listen to ' : 'Lytt til '} ${release.title}`;

    const regex = new RegExp(searchString, "gi");


    const artistNameMatch = release.artistName.match(regex);
    const titleMatch = release.title.match(regex);
    const genreMatch = release.genre.match(regex);

    const artistNamePoints = artistNameMatch ? artistNameMatch.length * 15 : 0;
    const titlePoints = titleMatch ? titleMatch.length * 15 : 0;
    const genrePoints = genreMatch ? genreMatch.length * 5 : 0;

    const points = artistNamePoints + titlePoints + genrePoints;

    return {
      type: 'release',
      text: `${release.artistName} ${release.title} (${release.genre})`,
      points,
      link,
      linkTitle
    }
  }

  getSearchResultsFromReleases(releases, searchString){
    const searchResultsFromReleases = releases.map(release => {
      return this.getSearchPointsFromRelease(release, searchString);
    })
    return searchResultsFromReleases.filter(result => {
      return result.points && result.points > 0;
    });
  }

  getSearchPointsFromPost(post, searchString){
    const selectedLanguageKey = this.props.selectedLanguageKey;

    const id = convertToUrlFriendlyString(post.title[selectedLanguageKey]);
    const link = `/${this.props.getLanguageSlug(selectedLanguageKey)}posts/${id}/`;
    const linkTitle = post.title[selectedLanguageKey];

    const regex = new RegExp(searchString, "gi");

    const titleMatch = post.title[selectedLanguageKey].match(regex);
    const contentMatch = post.content[selectedLanguageKey].match(regex);

    const titlePoints = titleMatch ? titleMatch.length * 5 : 0;
    const contentPoints = contentMatch ? contentMatch.length : 0;

    const points = titlePoints + contentPoints;

    return {
      type: 'post',
      text: post.title[selectedLanguageKey],
      points,
      link,
      linkTitle
    }
  }

  getSearchResultsFromPosts(posts, searchString){
    const searchResultsFromPosts = posts.map(post => {
      return this.getSearchPointsFromPost(post, searchString);
    })
    return searchResultsFromPosts.filter(result => {
      return result.points && result.points > 0;
    });
  }

  handleShowResultsList(event) {
    const searchString = event.target.value.replace(/[^a-å0-9-]+/ig, ""); // Removes unwanted characters

    if (searchString.length) {
      const searchResultsFromReleases = this.getSearchResultsFromReleases(releases, searchString);
      const searchResultsFromPosts = this.getSearchResultsFromPosts(allPosts, searchString);
      const results = searchResultsFromReleases.concat(searchResultsFromPosts);
      this.setState({
        showResultsList: true,
        results: results.sort((a, b) => b.points - a.points)
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
        release: ['fas', 'music']
      };
      const resultsElements = results.map((result, resultKey) => {
        return (<a href={result.link} title={result.linkTitle} key={resultKey} className={style.resultsListItem}>
          <FontAwesomeIcon icon={itemTypeIcons[result.type]}/> {result.text}
        </a>)
      });
      return resultsElements;
    } else {
      return selectedLanguageKey === 'en' ? 'No results' : 'Ingen resultat';
    }
  }

  render() {
    return (<React.Fragment>
      <div className={style.searchFieldContainer}>
        <FontAwesomeIcon icon={['fas', 'search']}/>
        <input type="search" onChange={(event) => this.handleShowResultsList(event)} placeholder={this.props.selectedLanguageKey === 'en' ? 'Search' : 'Søk'} className={style.searchField} />
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

const mapStateToProps = state => ({
  selectedLanguageKey: state.selectedLanguageKey,
  location: state.router.location
});

const mapDispatchToProps = {
  getLanguageSlug
};

export default connect(mapStateToProps, mapDispatchToProps)(SearchField);
