// Dependencies
import React from 'react';
import PropTypes from 'prop-types';

// Stylesheets
import style from 'components/template/List/ListItem/ListItemVideo.module.scss';

class ListItemThumbnail extends React.Component {
  render() {
    return (
      <div className={style.videoContainer}>
        <iframe width="945" height="532" title={this.props.videoTitle} src={`https://www.youtube.com/embed/${this.props.youTubeId}`} frameBorder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowFullScreen>
        </iframe>
      </div>
    )
  }
};

ListItemThumbnail.propTypes = {
  youTubeId: PropTypes.string,
  videoTitle: PropTypes.string
};

ListItemThumbnail.defaultProps = {
};

export default ListItemThumbnail;
