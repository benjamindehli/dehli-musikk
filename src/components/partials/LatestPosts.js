// Dependencies
import React, {Component} from 'react';
import {connect} from 'react-redux';

// Components
import List from 'components/template/List';
import ListItem from 'components/template/List/ListItem';
import Post from 'components/partials/Post';

// Data
import {latestPosts} from 'data/posts';


class LatestPosts extends Component {
  renderPosts() {
    return latestPosts && latestPosts.length
      ? latestPosts.map(post => {
        return (<ListItem key={post.id}>
          <Post post={post}/>
        </ListItem>)
      })
      : '';
  }

  render() {
    return (<List>
      {this.renderPosts()}
    </List>)
  }
}

export default connect(null, null)(LatestPosts);
