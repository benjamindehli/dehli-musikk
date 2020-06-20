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

  toggleExpand() {
    this.setState({
      expanded: !this.state.expanded
    }, () => {
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
  }

  render() {
    const containerElementStyle = {
      maxHeight: this.state.height
    };
    return (<React.Fragment>
      <h2 onClick={() => this.toggleExpand()} className={`${style.expansionPanelHeader} ${this.state.expanded ? style.expanded : ''}`}>
        <span>{this.props.panelTitle}</span>
        <FontAwesomeIcon icon={['fas', 'chevron-down']} />
      </h2>
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
