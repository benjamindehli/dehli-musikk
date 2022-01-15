// Components
import List from 'components/template/List';
import ListItem from 'components/template/List/ListItem';
import Release from 'components/partials/Portfolio/Release';

// Data
import { latestReleases } from 'data/portfolio';

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
