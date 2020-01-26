// Dependencies
import React, {Component} from 'react';
import {connect} from 'react-redux';

// Components
import Post from '../partials/Post';

// Data
import {latestPosts} from '../../data/posts';

// Stylesheets
import style from './LatestPosts.module.scss';

class LatestPosts extends Component {

  renderPosts() {
    return latestPosts && latestPosts.length
      ? latestPosts.map(post => {
        return <Post key={post.id} post={post}/>
      })
      : '';
  }

  render() {
    return (<div className={style.container}>
        <div className={style.grid}>
          {this.renderPosts()}
        </div>
    </div>)
  }
}

export default connect(null, null)(LatestPosts);
