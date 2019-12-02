// Dependencies
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router-dom';

import SocialMediaLinks from '../partials/SocialMediaLinks';
import DehliMusikkLogo from '../../assets/svg/DehliMusikkLogoInverse.svg'
// Stylesheets
import style from './Home.module.scss';

class Home extends Component {

  componentDidMount() {
  }


  render() {
    return (<div>
      <div className={style.header}>
      {this.renderHeaderImage(this.state.headerImage)}
        <div className={style.overlay}>
          <span className={style.logo}>
            <img src={DehliMusikkLogo} alt='Logo for Dehli Musikk'/>
          </span>
        </div>
      </div>

      <div className={style.contentSection}>
        <h1>Dehli Musikk</h1>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam maximus neque ac dolor porta fringilla. Aliquam eget orci sollicitudin, facilisis augue convallis, commodo ante. Aliquam vitae magna eu ante porta pharetra. Pellentesque nisl eros, mollis eget finibus id, ultrices at elit. Nunc vitae convallis ex.
        </p>
        <Link to='/portfolio'>portfolio</Link>
        <h2>Portfolio</h2>
        <p>Aliquam erat volutpat. Donec varius justo nibh, vel malesuada mi dapibus at. Sed maximus pulvinar erat, eget ornare ex lobortis vitae. Quisque nec turpis mauris. Mauris in commodo elit. In non purus justo. Nunc rhoncus tortor vitae fringilla condimentum. Sed ultrices mi eros, eget tempus nisi congue ut.
        </p>
        <h2>Hoyhoy</h2>
        <p>Aliquam malesuada faucibus arcu ac aliquam. Donec at volutpat urna. Duis volutpat pretium mi, ut mollis risus dignissim eget. Proin eget scelerisque lacus. In at pharetra nisl, vitae facilisis libero. Maecenas scelerisque hendrerit scelerisque. Nulla consequat elit ut urna porttitor, in sodales libero pellentesque. Cras nec turpis urna. Nulla non varius libero.
        </p>
      </div>
      <div className={style.socialMediaSection}>
        <div className={style.contentSection}>
          <SocialMediaLinks/>
        </div>
      </div>
    </div>)
  }
}

const mapStateToProps = null;

const mapDispatchToProps = null;

export default connect(mapStateToProps, mapDispatchToProps)(Home);
