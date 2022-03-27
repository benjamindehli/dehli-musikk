// Dependencies
import { connect, useDispatch, useSelector } from 'react-redux';
import { saveAs } from 'file-saver';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// Components
import ActionButtonBar from 'components/partials/ActionButtonBar';
import Video from 'components/partials/Video';

// Actions
import { createVideo, updateVideos } from 'actions/VideosActions';

// Stylesheets
import style from 'components/routes/Dashboard.module.scss';
import commonStyle from 'components/partials/commonStyle.module.scss';
import "react-datepicker/dist/react-datepicker.css";


const Videos = () => {
  const dispatch = useDispatch();

  // Redux store
  const videos = useSelector(state => state.videos)


  const saveFileContent = (fileContent, latest = true) => {
    const filename = latest ? "latest.json" : 'all.json';
    fileContent.sort((a, b) => (parseFloat(b.timestamp) + parseFloat(b?.orderNumber || 0)) - (parseFloat(a.timestamp) + parseFloat(a?.orderNumber || 0)));

    if (latest) {
      fileContent = fileContent.slice(0, 3);
    }
    const contentString = JSON.stringify(fileContent);
    const blob = new Blob([contentString], {
      type: "application/json;charset=utf-8"
    });
    saveAs(blob, filename);
  }

  const createVideoInStore = () => {
    dispatch(createVideo(videos));
  }


  const renderVideosFields = () => {
    return videos && videos.length
      ? videos.map((video, index) => {
        return (
          <Video videoData={video} index={index} key={`video-${video.id}${index}`} />

        )
      }) : '';
  }

  return (<div className={style.contentSection}>
    <h1>Videos</h1>
    {renderVideosFields()}
    <ActionButtonBar>
      <button onClick={createVideoInStore} className={commonStyle.bgGreen}><FontAwesomeIcon icon={['fas', 'plus']} /> Add</button>
      <button onClick={() => saveFileContent(videos, true)} className={commonStyle.bgBlue}><FontAwesomeIcon icon={['fas', 'download']} /> Latest</button>
      <button onClick={() => saveFileContent(videos, false)} className={commonStyle.bgBlue}><FontAwesomeIcon icon={['fas', 'download']} /> All</button>
    </ActionButtonBar>
  </div>)
}

const mapStateToProps = state => ({ videos: state.videos });

const mapDispatchToProps = {
  createVideo,
  updateVideos
};

export default connect(mapStateToProps, mapDispatchToProps)(Videos);
