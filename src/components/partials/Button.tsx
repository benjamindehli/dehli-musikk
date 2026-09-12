// Types
import type { ReactNode } from "react";

// Stylesheets
import style from "components/partials/Button.module.scss";

const Button = ({ buttontype = "default", children }: { buttontype?: string; children?: ReactNode }) => {
    return (
        <span className={`${style.button} ${style[buttontype]}`}>
            <span className={style.content}>{children}</span>
        </span>
    );
};

export default Button;
