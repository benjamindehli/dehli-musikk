// Components
import List from 'components/template/List';
import ListItem from 'components/template/List/ListItem';
import Post from 'components/partials/Post';

// Data
import { latestPosts } from 'data/posts';


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
