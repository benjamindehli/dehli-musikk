"use client";
import React, { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import style from "components/template/ExpansionPanel.module.scss";

const ExpansionPanel = ({ panelTitle, children, elementId }) => {
    const [expanded, setExpanded] = useState(false);
    const [maxHeight, setMaxHeight] = useState(0);

    const containerRef = useRef(null);

    /*
     * useId rather than Math.random, which drew a new value on every render:
     * the server and the client never agreed on the id, and the aria-controls
     * and aria-labelledby links pointed at elements whose ids had already
     * changed. It also made the hash effect below re-run on each render.
     */
    const generatedId = useId();
    const id = elementId || generatedId;

    // Measure content height BEFORE paint to avoid CLS
    useLayoutEffect(() => {
        if (containerRef.current) {
            setMaxHeight(containerRef.current.scrollHeight);
        }
    }, [children]);

    /*
     * Auto-expand if URL hash matches. The hash is browser-only state that does
     * not exist while the page is being rendered on the server, so reading it
     * during render would hydrate to the wrong panel. An effect is the only
     * place it can be read, which is why the setState rule is waived here.
     */
    useEffect(() => {
        if (id === window.location?.hash?.substring(1)) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setExpanded(true);
        }
    }, [id]);

    const toggleExpand = () => setExpanded((prev) => !prev);

    return (
        <>
            <button id={id} className={style.expandButton} onClick={toggleExpand} aria-expanded={expanded} aria-controls={`${id}-content`}>
                <h2 className={`${style.expansionPanelHeader} ${expanded ? style.expanded : ""}`}>
                    <span id={`${id}-title`}>{panelTitle}</span>
                    <FontAwesomeIcon icon={faChevronDown} />
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
                    maxHeight: expanded ? `${maxHeight}px` : "0px"
                }}
                inert={!expanded}
            >
                {children}
            </div>
        </>
    );
};

export default ExpansionPanel;
