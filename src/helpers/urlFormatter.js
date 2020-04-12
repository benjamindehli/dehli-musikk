const replaceAndAddSpace = (string, replace, replaceWith) => {
  string = string.replace(new RegExp(`([^s])([${replace}])([^s])`, 'ig'), `$1 ${replaceWith} $3`); // Character right before and after
  string = string.replace(new RegExp(`([^s])([${replace}])`, 'ig'), `$1 ${replaceWith}`); // Character right before
  string = string.replace(new RegExp(`([${replace}])([^s])`, 'ig'), `${replaceWith} $2`); // Character right after
  string = string.replace(new RegExp(`[${replace}]`, 'ig'), replaceWith); // No character right before or after

  return string;
}

export const convertToUrlFriendlyString = string => {
  if (string) {
    // To lower case
    string = string.toLowerCase();

    // Character replace
    string = replaceAndAddSpace(string, "&", "and");
    string = replaceAndAddSpace(string, "+", "plus");
    string = string.replace("æ", "ae");
    string = string.replace("ä", "ae");
    string = string.replace("ø", "oe");
    string = string.replace("ö", "oe");
    string = string.replace("å", "aa");

    // Whitespace replace
    string = string.replace(" - ", "-");
    string = string.replace(/[\s]+/g, "-");

    // Unwated character replace
    string = string.replace(/[^a-z0-9-]+/ig, "");

    // Remove any character before first and after last A-Z or 0-9
    string = string.replace(/^[^A-Z0-9]*|[^a-z0-9]*$/ig, "");

    return string;
  } else {
    return '';
  }
}
