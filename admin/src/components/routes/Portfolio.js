// Dependencies
import { useDispatch, useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// Components
import ActionButtonBar from 'components/partials/ActionButtonBar';
import Release from 'components/partials/Release';

// Actions
import { createRelease } from 'actions/ReleasesActions';

// Stylesheets
import style from 'components/routes/Dashboard.module.scss';
import commonStyle from 'components/partials/commonStyle.module.scss';

const Portfolio = () => {

  const dispatch = useDispatch();

  // Redux store
  const releases = useSelector(state => state.releases)

  const createReleaseInStore = () => {
    dispatch(createRelease(releases));
  }

  const renderReleasesFields = (releases) => {
    return releases && releases.length
      ? releases.map((release, index) => {
        return <Release releaseData={release} index={index} key={`release-${release.id}${index}`} />
      }) : '';
  }

  return (
    <div className={style.contentSection}>
      <h1>Portfolio </h1>
      {renderReleasesFields(releases)}
      <ActionButtonBar>
        <button onClick={createReleaseInStore} className={commonStyle.bgGreen}>
          <FontAwesomeIcon icon={['fas', 'plus']} /> Add
        </button>
      </ActionButtonBar>
    </div>
  )
}

export default Portfolio;
