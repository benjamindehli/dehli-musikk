import type { FaqItem } from "types/content";
import { readDataFile } from "@admin/lib/dataFiles";
import FaqForm from "./FaqForm";

export const dynamic = "force-dynamic";

export default async function FaqPage() {
    const items = await readDataFile<FaqItem[]>("frequentlyAskedQuestions");
    return (
        <>
            <h1>Frequently asked questions ({items.length})</h1>
            <p className="admin-hint">
                Answers can link with <code>[text](products/overtonium/)</code>. These answers are also what search engines and AI assistants quote
                most directly, so a fact stated plainly here is worth more than one implied elsewhere.
            </p>
            <FaqForm
                initial={items.map((item) => ({
                    questionNo: item.question.no,
                    questionEn: item.question.en,
                    answerNo: item.answer.no,
                    answerEn: item.answer.en
                }))}
            />
        </>
    );
}
