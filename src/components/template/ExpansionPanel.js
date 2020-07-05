// Dependencies
import React from 'react';
import PropTypes from 'prop-types';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';

// Stylesheets
import style from 'components/template/ExpansionPanel.module.scss';

class ExpansionPanel extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      expanded: true,
      containerHeight: null
    };
  }

  makeLinksNotTabable(linkElements){
    for (let item of linkElements) {
        if (item.dataset.tabable){
          item.tabIndex = -1;
        }
    }
  };

  makeLinksTabable(linkElements){
    for (let item of linkElements) {
        if (item.dataset.tabable){
          item.tabIndex = 0;
        }
    }
  };

  toggleExpand() {
    this.setState({
      expanded: !this.state.expanded
    }, () => {
      const linkElements = this.containerElement.getElementsByTagName('a');
      this.state.expanded ? this.makeLinksTabable(linkElements) : this.makeLinksNotTabable(linkElements);
      this.setState({
        height: this.state.expanded ? this.state.containerHeight : 0
      })
    });
  }

  componentDidMount() {
    const containerHeight = this.containerElement.clientHeight;
    this.setState({ containerHeight, height: containerHeight }, () => {
      this.setState({
        expanded: false,
        height: 0
      })
    });
    const linkElements = this.containerElement.getElementsByTagName('a');
    this.makeLinksNotTabable(linkElements);
  }

  render() {
    const containerElementStyle = {
      maxHeight: this.state.height
    };
    return (<React.Fragment>
      <button className={style.expandButton} onClick={() => this.toggleExpand()}>
        <h2 className={`${style.expansionPanelHeader} ${this.state.expanded ? style.expanded : ''}`}>
          <span>{this.props.panelTitle}</span>
          <FontAwesomeIcon icon={['fas', 'chevron-down']} />
        </h2>
      </button>
      <div ref={containerElement => { this.containerElement = containerElement }}
           className={`${style.expansionPanelContent} ${this.state.expanded ? style.expanded : ''}`}
           style={containerElementStyle}>
        {this.props.children}
      </div>
    </React.Fragment>)
  }
};

ExpansionPanel.propTypes = {
  panelTitle: PropTypes.string
};

ExpansionPanel.defaultProps = {
  panelTitle: ''
};

export default ExpansionPanel;
