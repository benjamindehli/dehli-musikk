// Components
import List from 'components/template/List';
import ListItem from 'components/template/List/ListItem';
import Video from 'components/partials/Video';

// Data
import { latestVideos } from 'data/videos';


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
