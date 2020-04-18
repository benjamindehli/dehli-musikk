export const convertToXmlFriendlyString = string => {
  if (string) {
var oldString = string;
    // Character replace
    string = string.replace(/&/g, "&amp;");
    string = string.replace(/</g, "&lt;");
    string = string.replace(/>/g, "&gt;");
    string = string.replace(/"/g, '&quot;');
    string = string.replace(/'/g, "&apos;");
if (oldString !== string){
  console.log("old:", oldString);
  console.log("new:", string);
}
    return string;
  } else {
    return '';
  }
}
