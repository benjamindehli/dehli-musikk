// Dependencies
import React from "react";
import { PrerenderedComponent } from "react-prerendered-component";
import loadable from "@loadable/component";

function prerenderedLoadable(dynamicImport) {
    const LoadableComponent = loadable(dynamicImport);
    return React.memo((props) => (
        <PrerenderedComponent live={LoadableComponent.load()}>
            <LoadableComponent {...props} />
        </PrerenderedComponent>
    ));
}

export default prerenderedLoadable;
