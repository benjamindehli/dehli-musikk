"use server";

import { revalidatePath } from "next/cache";
import type { FaqItem } from "types/content";
import { convertToUrlFriendlyString } from "helpers/urlFormatter";
import { writeDataFile } from "@admin/lib/dataFiles";
import { Problems, texts, type FormState } from "@admin/lib/forms";

/*
 * The FAQ is one short list, so it is edited and saved as a whole: the order
 * of the rows on the form is the order on the page.
 */
export async function saveFaq(_previous: FormState, form: FormData): Promise<FormState> {
    const questionsNo = texts(form, "questionNo");
    const questionsEn = texts(form, "questionEn");
    const answersNo = texts(form, "answerNo");
    const answersEn = texts(form, "answerEn");

    const problems = new Problems();
    // Keys as the file has them, English first.
    const items: FaqItem[] = questionsNo.map((no, i) => ({
        question: { en: questionsEn[i] ?? "", no },
        answer: { en: answersEn[i] ?? "", no: answersNo[i] ?? "" }
    }));
    items.forEach((item, i) => {
        if (!item.question.no || !item.question.en || !item.answer.no || !item.answer.en)
            problems.add(`Question ${i + 1} needs its question and answer in both languages.`);
    });

    // Each question is an anchor on the page (#is-dehli-musikk-a-music-store), so two
    // that slug the same would share one, and a link to the second would land on the first.
    for (const lang of ["no", "en"] as const) {
        const seen = new Map<string, number>();
        items.forEach((item, i) => {
            const anchor = convertToUrlFriendlyString(item.question[lang]);
            if (anchor && seen.has(anchor)) problems.add(`Questions ${seen.get(anchor)! + 1} and ${i + 1} would share the anchor #${anchor}.`);
            seen.set(anchor, i);
        });
    }
    if (problems.any) return problems.state();

    await writeDataFile("frequentlyAskedQuestions", items);
    revalidatePath("/faq", "layout");
    return { status: "saved", message: `Saved ${items.length} questions to src/data/frequentlyAskedQuestions/data/all.json.` };
}
