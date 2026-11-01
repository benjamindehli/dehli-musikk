"use client";

import { startTransition, useActionState, useState, type FormEvent } from "react";
import { convertToUrlFriendlyString } from "helpers/urlFormatter";
import { IDLE } from "@admin/lib/forms";
import FormStatus from "@admin/components/FormStatus";
import { saveFaq } from "./actions";

type Row = { questionNo: string; questionEn: string; answerNo: string; answerEn: string };

// Rows need a stable identity for React while they are moved around; the text can change.
type KeyedRow = Row & { key: number };

export default function FaqForm({ initial }: { initial: Row[] }) {
    const [state, formAction, pending] = useActionState(saveFaq, IDLE);
    const [rows, setRows] = useState<KeyedRow[]>(initial.map((row, key) => ({ ...row, key })));
    const [nextKey, setNextKey] = useState(initial.length);

    const update = (key: number, field: keyof Row, value: string) =>
        setRows((current) => current.map((row) => (row.key === key ? { ...row, [field]: value } : row)));
    const move = (index: number, by: -1 | 1) =>
        setRows((current) => {
            const target = index + by;
            if (target < 0 || target >= current.length) return current;
            const copy = [...current];
            [copy[index], copy[target]] = [copy[target], copy[index]];
            return copy;
        });
    const add = () => {
        setRows((current) => [...current, { key: nextKey, questionNo: "", questionEn: "", answerNo: "", answerEn: "" }]);
        setNextKey(nextKey + 1);
    };

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        startTransition(() => formAction(data));
    };

    return (
        <form onSubmit={submit} className="admin-form">
            <FormStatus state={state} />
            {rows.map((row, index) => (
                <fieldset key={row.key}>
                    <legend>
                        {index + 1}. {row.questionEn || "New question"}
                    </legend>
                    <div className="admin-row">
                        <label>
                            Norwegian question
                            <input
                                name="questionNo"
                                value={row.questionNo}
                                onChange={(event) => update(row.key, "questionNo", event.target.value)}
                                required
                            />
                            <span className="admin-hint">#{convertToUrlFriendlyString(row.questionNo)}</span>
                        </label>
                        <label>
                            English question
                            <input
                                name="questionEn"
                                value={row.questionEn}
                                onChange={(event) => update(row.key, "questionEn", event.target.value)}
                                required
                            />
                            <span className="admin-hint">#{convertToUrlFriendlyString(row.questionEn)}</span>
                        </label>
                    </div>
                    <div className="admin-row">
                        <label>
                            Norwegian answer
                            <textarea
                                name="answerNo"
                                value={row.answerNo}
                                onChange={(event) => update(row.key, "answerNo", event.target.value)}
                                rows={5}
                                required
                            />
                        </label>
                        <label>
                            English answer
                            <textarea
                                name="answerEn"
                                value={row.answerEn}
                                onChange={(event) => update(row.key, "answerEn", event.target.value)}
                                rows={5}
                                required
                            />
                        </label>
                    </div>
                    <div className="admin-actions">
                        <button type="button" className="admin-button" onClick={() => move(index, -1)} aria-label={`Move question ${index + 1} up`}>
                            ↑
                        </button>
                        <button type="button" className="admin-button" onClick={() => move(index, 1)} aria-label={`Move question ${index + 1} down`}>
                            ↓
                        </button>
                        <button
                            type="button"
                            className="admin-button admin-button-danger"
                            onClick={() => setRows((current) => current.filter((candidate) => candidate.key !== row.key))}
                        >
                            Remove
                        </button>
                    </div>
                </fieldset>
            ))}
            <div className="admin-actions">
                <button type="button" className="admin-button" onClick={add}>
                    Add question
                </button>
                <button type="submit" className="admin-button" disabled={pending}>
                    {pending ? "Saving..." : "Save all"}
                </button>
            </div>
        </form>
    );
}
