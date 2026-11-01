import type { FormState } from "@admin/lib/forms";

/** The result of the last submit, announced to screen readers as it changes. */
export default function FormStatus({ state }: { state: FormState }) {
    return (
        <div role="status" aria-live="polite">
            {state.status === "error" ? (
                <div className="admin-status admin-status-error">
                    <p>Not saved:</p>
                    <ul>
                        {state.errors.map((error) => (
                            <li key={error}>{error}</li>
                        ))}
                    </ul>
                </div>
            ) : null}
            {state.status === "saved" ? <p className="admin-status admin-status-saved">{state.message}</p> : null}
        </div>
    );
}
