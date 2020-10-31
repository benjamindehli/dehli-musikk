// Dependencies
import React, {Component} from 'react';
import {connect} from 'react-redux';

// Components
import List from 'components/template/List';
import ListItem from 'components/template/List/ListItem';
import Video from 'components/partials/Video';

// Helpers
import {convertToUrlFriendlyString} from 'helpers/urlFormatter'

// Data
import {latestVideos} from 'data/videos';


class LatestVideos extends Component {
  renderVideos() {
    return latestVideos && latestVideos.length
      ? latestVideos.map(video => {
        const videoId = convertToUrlFriendlyString(video.title[this.props.selectedLanguageKey]);
        return (<ListItem key={videoId}>
          <Video video={video}/>
        </ListItem>)
      })
      : '';
  }

  render() {
    return (<List>
      {this.renderVideos()}
    </List>)
  }
}

const mapStateToProps = state => ({
  selectedLanguageKey: state.selectedLanguageKey
});

export default connect(mapStateToProps, null)(LatestVideos);
