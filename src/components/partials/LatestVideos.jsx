// Components
import List from '../template/List';
import ListItem from '../template/List/ListItem';
import Video from './Video';

// Data
import { latestVideos } from '../../data/videos';


const LatestVideos = () => {
  const renderVideos = () => {
    return latestVideos && latestVideos.length
      ? latestVideos.map(video => {
        return (<ListItem key={video.id}>
          <Video video={video} />
        </ListItem>)
      })
      : '';
  }
  return (<List>
    {renderVideos()}
  </List>)
}

export default LatestVideos;
