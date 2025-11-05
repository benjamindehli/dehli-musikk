// Stylesheets
import style from "components/template/List/ListItem/ListItemVideo.module.scss";

const ListItemThumbnail = ({ videoTitle, youTubeId, startOffset }) => {
    const videoSrc = `https://www.youtube.com/embed/${youTubeId}${startOffset ? `?start=${startOffset}` : ""}`;
    return (
        <div className={style.videoContainer}>
            <iframe width="945" height="532" title={videoTitle} src={videoSrc} frameBorder="0" allowFullScreen></iframe>
        </div>
    );
};

export default ListItemThumbnail;
