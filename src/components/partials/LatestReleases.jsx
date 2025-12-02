// Components
import List from '../template/List';
import ListItem from '../template/List/ListItem';
import Release from './Portfolio/Release';

// Data
import { latestReleases } from '../../data/portfolio';

const LatestReleases = () => {

  const renderReleases = () => {
    return latestReleases && latestReleases.length
      ? latestReleases.map(release => {
        return (<ListItem key={release.id}>
          <Release release={release} />
        </ListItem>)
      })
      : '';
  }

  return (<List>
    {renderReleases()}
  </List>)
}

export default LatestReleases;
