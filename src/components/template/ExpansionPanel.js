import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import style from "components/template/ExpansionPanel.module.scss";

const ExpansionPanel = ({ panelTitle, children, elementId }) => {
  const [expanded, setExpanded] = useState(false);
  const [maxHeight, setMaxHeight] = useState(0);

  const containerRef = useRef(null);

  const id = elementId || `expansion-panel-${Math.random().toString(36).slice(2, 9)}`;

  // Measure content height BEFORE paint to avoid CLS
  useLayoutEffect(() => {
    if (containerRef.current) {
      setMaxHeight(containerRef.current.scrollHeight);
    }
  }, [children]);

  // Auto-expand if URL hash matches
  useEffect(() => {
    if (id === window.location?.hash?.substring(1)) {
      setExpanded(true);
    }
  }, [id]);

  const toggleExpand = () => setExpanded((prev) => !prev);

  return (
    <>
      <button
        id={id}
        className={style.expandButton}
        onClick={toggleExpand}
        aria-expanded={expanded}
        aria-controls={`${id}-content`}
      >
        <h2 className={`${style.expansionPanelHeader} ${expanded ? style.expanded : ""}`}>
          <span id={`${id}-title`}>{panelTitle}</span>
          <FontAwesomeIcon icon={["fas", "chevron-down"]} />
        </h2>
      </button>

      <div
        ref={containerRef}
        id={`${id}-content`}
        role="region"
        aria-labelledby={`${id}-title`}
        aria-hidden={!expanded}
        className={`${style.expansionPanelContent} ${expanded ? style.expanded : ""}`}
        style={{
          maxHeight: expanded ? `${maxHeight}px` : "0px",
        }}
        inert={!expanded ? "" : undefined}
      >
        {children}
      </div>
    </>
  );
};

export default ExpansionPanel;