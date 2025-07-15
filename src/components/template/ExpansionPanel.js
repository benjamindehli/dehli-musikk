// Dependencies
import React, { useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// Stylesheets
import style from 'components/template/ExpansionPanel.module.scss';

const ExpansionPanel = ({ panelTitle, children, elementId }) => {

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

  const hasSameIdAsHash = (elementId) => {
    return elementId === window.location?.hash?.substring(1);
  };

  const toggleExpand = () => {
    setExpanded(!expanded)
    !expanded ? makeLinksTabable(linkElements) : makeLinksNotTabable(linkElements);
  }

  const generateRandomId = () => {
    return `expansion-panel-${Math.random().toString(36).substring(2, 9)}`;
  };

  useEffect(() => {
    setIsInitiated(false);
    setExpanded(false);
  }, [children])

  useEffect(() => {
    if (!isInitiated) {
      setExpanded(true);
      setLinkElements(containerElement.current.getElementsByTagName('a'));
      setMaxHeight(containerElement.current.clientHeight);
      setIsInitiated(true);
    } else {
      if (hasSameIdAsHash(elementId)) {
        setExpanded(true);
        makeLinksTabable(linkElements);
      } else {
        setExpanded(false);
        makeLinksNotTabable(linkElements);
      }
    }
  }, [isInitiated, linkElements])



  const containerElementStyle = {
    maxHeight: expanded
      ? maxHeight
      : isInitiated ? 0 : 'none'
  };

  const elementIdWithFallback = elementId || generateRandomId();

  return (<React.Fragment>
    <button id={elementIdWithFallback} className={style.expandButton} onClick={toggleExpand} aria-expanded={expanded ? "true" : "false"} aria-controls={`${elementIdWithFallback}-content`}>
      <h2 className={`${style.expansionPanelHeader} ${expanded ? style.expanded : ''}`}>
        <span id={`${elementIdWithFallback}-title`}>{panelTitle}</span>
        <FontAwesomeIcon icon={['fas', 'chevron-down']} />
      </h2>
    </button>
    <div ref={containerElement} id={`${elementIdWithFallback}-content`} role="region" aria-labelledby={`${elementIdWithFallback}-title`}
      className={`${style.expansionPanelContent} ${expanded ? style.expanded : ''}`}
      style={containerElementStyle}>
      {children}
    </div>
  </React.Fragment>)
};

export default ExpansionPanel;
