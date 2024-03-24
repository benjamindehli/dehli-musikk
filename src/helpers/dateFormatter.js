const monthNames = {
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  no: ['Januar', 'Februar', 'Mars', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Desember']
}

export const getPrettyDate = (date, language) => {
    const year = date.getFullYear();
    const month = monthNames[language][date.getMonth()];
    const day = date.getDate();
    if (language === 'en'){
      return `${month} ${day}, ${year}`;
    }else {
      return `${day}. ${month} ${year}`;
    }
}

export const getRichSnippetDateString = (date) => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are 0 based, so we add 1
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}