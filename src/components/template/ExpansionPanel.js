// Dependencies
import React, { useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// Stylesheets
import style from 'components/template/ExpansionPanel.module.scss';

const ExpansionPanel = ({ panelTitle, children }) => {

  // State
  const [expanded, setExpanded] = useState();
  const [linkElements, setLinkElements] = useState(null);
  const [maxHeight, setMaxHeight] = useState(null);
  const [isInitiated, setIsInitiated] = useState(null);

  // Refs
  const containerElement = useRef();

  const makeLinksNotTabable = (linkElements) => {
    if (linkElements) {
      for (let item of linkElements) {
        if (item.dataset.tabable) {
          item.tabIndex = -1;
        }
      }
    }
  };

  const makeLinksTabable = (linkElements) => {
    if (linkElements) {
      for (let item of linkElements) {
        if (item.dataset.tabable) {
          item.tabIndex = 0;
        }
      }
    }
  };

  const toggleExpand = () => {
    setExpanded(!expanded)
    !expanded ? makeLinksTabable(linkElements) : makeLinksNotTabable(linkElements);
  }

  useEffect(() => {
    setIsInitiated(false);
  }, [children])

  useEffect(() => {
    if (!isInitiated) {
      setExpanded(true);
      setLinkElements(containerElement.current.getElementsByTagName('a'));
      setMaxHeight(containerElement.current.clientHeight);
      setIsInitiated(true);
    } else {
      setExpanded(false);
      makeLinksNotTabable(linkElements);
    }
  }, [isInitiated, linkElements])



  const containerElementStyle = {
    maxHeight: expanded
      ? maxHeight
      : isInitiated ? 0 : 'none'
  };

  return (<React.Fragment>
    <button className={style.expandButton} onClick={toggleExpand}>
      <h2 className={`${style.expansionPanelHeader} ${expanded ? style.expanded : ''}`}>
        <span>{panelTitle}</span>
        <FontAwesomeIcon icon={['fas', 'chevron-down']} />
      </h2>
    </button>
    <div ref={containerElement}
      className={`${style.expansionPanelContent} ${expanded ? style.expanded : ''}`}
      style={containerElementStyle}>
      {children}
    </div>
  </React.Fragment>)
};

export default ExpansionPanel;
