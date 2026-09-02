const monthNames = {
    en: [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
    ],
    /*
     * Lower case: Norwegian does not capitalise month names, unlike English.
     * These read as "28. mars 2021" mid-sentence, which is where they appear -
     * on post and video pages, and in the meta description fallback.
     */
    no: [
        "januar",
        "februar",
        "mars",
        "april",
        "mai",
        "juni",
        "juli",
        "august",
        "september",
        "oktober",
        "november",
        "desember"
    ]
};

export const getPrettyDate = (date, language) => {
    const year = date.getFullYear();
    const month = monthNames[language][date.getMonth()];
    const day = date.getDate();
    if (language === "en") {
        return `${month} ${day}, ${year}`;
    } else {
        return `${day}. ${month} ${year}`;
    }
};

export const getRichSnippetDateString = (date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Months are 0 based, so we add 1
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
};

export const getPlusOneYear = () => {
    return new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString();
};
