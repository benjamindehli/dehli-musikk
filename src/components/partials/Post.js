// Dependencies
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router-dom';

// Stylesheets
import style from './Post.module.scss';

class NavigationBar extends Component {

  renderPostThumbnail(image) {
    return (<picture>
      <source sizes='350px' srcSet={`${image.webp350} 350w`} type="image/webp"/>
      <source sizes='350px' srcSet={`${image.jpg350} 350w`} type="image/jpg"/>
      <img src={image.jpg350} alt="Post image"/>
    </picture>);
  }

  render() {
    const post = this.props.post;
    const imagePathWebp = `data/posts/thumbnails/web/webp/${post.thumbnailFilename}`;
    const imagePathJpg = `data/posts/thumbnails/web/jpg/${post.thumbnailFilename}`;
    const image = {
      webp350: require(`../../${imagePathWebp}_350.webp`),
      jpg350: require(`../../${imagePathJpg}_350.jpg`)
    };
    return (<article className={style.gridItem}>
      <figure className={style.thumbnail}>
        {this.renderPostThumbnail(image)}
      </figure>
      <div className={style.content}>
        <div className={style.header}>
          <h2>{post.title.no}</h2>
        </div>
        <div className={style.body}>
          {post.content.no.split('\n').map((paragraph, key) => {
            return (<p key={key}>{paragraph}</p>)
          })}
          <ul>
            <li>{new Date(post.timestamp).getFullYear()}</li>
          </ul>
        </div>
      </div>
    </article>)
  }
}

const mapStateToProps = null;

const mapDispatchToProps = null;

export default connect(mapStateToProps, mapDispatchToProps)(NavigationBar);
