// Stylesheets
import style from 'components/template/List/ListItem/ListItemVideo.module.scss';

const ListItemThumbnail = ({ videoTitle, youTubeId }) => {
  return (
    <div className={style.videoContainer}>
      <iframe width="945" height="532" title={videoTitle} src={`https://www.youtube.com/embed/${youTubeId}`} frameBorder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowFullScreen>
      </iframe>
    </div>
  )
};

export default ListItemThumbnail;
