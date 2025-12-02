// Components
import List from '../template/List';
import ListItem from '../template/List/ListItem';
import Post from './Post';

// Data
import { latestPosts } from '../../data/posts';


const LatestPosts = () => {
  const renderPosts = () => {
    return latestPosts && latestPosts.length
      ? latestPosts.map(post => {
        return (<ListItem key={post.id}>
          <Post post={post} />
        </ListItem>)
      })
      : '';
  }

  return (<List>
    {renderPosts()}
  </List>)
}

export default LatestPosts;
