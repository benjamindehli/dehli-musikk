// Dependencies
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'

// Stylesheets
import style from 'components/partials/SocialMediaLinks.module.scss';

class SocialMediaLinks extends Component {

  render() {
    return (<div className={style.socialMediaLinks}>
      <a href='https://www.facebook.com/DehliMusikk/' title='Link to Facebook page' aria-label='Link to Facebook page' target='_blank' rel="noopener noreferrer" className={style.facebook}>
        <FontAwesomeIcon icon={['fab', 'facebook-f']} alt='Facebook logo'/>
      </a>
      <a href='https://www.instagram.com/benjamindehli/' title='Link to Instagram page' aria-label='Link to Instagram page' target='_blank' rel="noopener noreferrer" className={style.instagram}>
        <FontAwesomeIcon icon={['fab', 'instagram']} alt='Instagram logo'/>
      </a>
      <a href='https://www.youtube.com/c/BenjaminDehli' title='Link to Youtube channel' aria-label='Link to Youtube channel' target='_blank' rel="noopener noreferrer" className={style.youtube}>
        <FontAwesomeIcon icon={['fab', 'youtube']} alt='Youtube logo'/>
      </a>
      <a href='https://vimeo.com/benjamindehli' title='Link to Vimeo page' aria-label='Link to Vimeo page' target='_blank' rel="noopener noreferrer" className={style.vimeo}>
        <FontAwesomeIcon icon={['fab', 'vimeo-v']} alt='Vimeo logo'/>
      </a>
      <a href='https://benjamindehli.tumblr.com/' title='Link to Tumblr page' aria-label='Link to Tumblr page' target='_blank' rel="noopener noreferrer" className={style.tumblr}>
        <FontAwesomeIcon icon={['fab', 'tumblr']} alt='Tumblr logo'/>
      </a>
      <a href='https://twitter.com/BenjaminDehli' title='Link to Twitter page' aria-label='Link to Twitter page' target='_blank' rel="noopener noreferrer" className={style.twitter}>
        <FontAwesomeIcon icon={['fab', 'twitter']} alt='Twitter logo'/>
      </a>
    </div>)
  }
}

const mapStateToProps = null;

const mapDispatchToProps = null;

export default connect(mapStateToProps, mapDispatchToProps)(SocialMediaLinks);
