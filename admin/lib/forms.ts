/*
 * Reading form fields in server actions. Everything a form posts is a string or
 * absent, so these trim, and turn the absent case into the empty string, which
 * the validation in each action then treats as missing.
 */
export function text(form: FormData, name: string): string {
    return clean(form.get(name));
}

/** Every value posted under a repeated field name, such as the rows of a list. */
export function texts(form: FormData, name: string): string[] {
    return form.getAll(name).map(clean);
}

/*
 * Browsers submit textarea line breaks as CRLF. The data uses plain \n (the
 * video descriptions are multi-line), so a save that kept the CRs would change
 * every line of text it touched without anything visibly different.
 */
function clean(value: FormDataEntryValue | null): string {
    return typeof value === "string" ? value.replace(/\r\n?/g, "\n").trim() : "";
}

export function checked(form: FormData, name: string): boolean {
    return form.get(name) === "on";
}

/** The outcome a form shows after submitting: nothing yet, the errors, or a confirmation. */
export type FormState = { status: "idle" } | { status: "error"; errors: string[] } | { status: "saved"; message: string };

export const IDLE: FormState = { status: "idle" };

/** Collects validation problems, so a form reports all of them at once rather than one per submit. */
export class Problems {
    readonly list: string[] = [];

    require(value: string, label: string): string {
        if (!value) this.list.push(`${label} is required.`);
        return value;
    }

    add(message: string): void {
        this.list.push(message);
    }

    get any(): boolean {
        return this.list.length > 0;
    }

    state(): FormState {
        return { status: "error", errors: this.list };
    }
}

const ABSOLUTE_URL = /^https?:\/\/[^\s]+$/i;

export function isAbsoluteUrl(value: string): boolean {
    return ABSOLUTE_URL.test(value);
}

/*
 * Internal links in posts are site-relative paths without the language prefix,
 * e.g. "products/overtonium/": the site adds "/" or "/en/" in front.
 */
const SITE_PATH = /^[a-z0-9][a-z0-9/_-]*\/$/;

export function isSitePath(value: string): boolean {
    return SITE_PATH.test(value);
}
