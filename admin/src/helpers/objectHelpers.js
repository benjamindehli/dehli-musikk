export const updatePropertyInArray = (oldArray, index, value, propertyKey) => {
  let newArray = oldArray;
  newArray[index] = {
    ...newArray[index],
    [propertyKey]: value
  };
  return newArray;
}

export const updateMultilingualPropertyInArray = (oldArray, index, value, propertyKey, language) => {
  let newArray = oldArray;
  newArray[index] = {
    ...newArray[index],
    [propertyKey]: {
      ...newArray[index][propertyKey],
      [language]: value
    }
  };
  return newArray;
}

export const getOrderNumberString = orderNumber => {
  if (!orderNumber) {
    return '00';
  } else if (orderNumber < 10) {
    return `0${orderNumber}`;
  } else {
    return orderNumber;
  }
}

export const getGeneratedIdByDate = (date, orderNumber) => {
  const day = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
  const month = (date.getMonth() + 1) < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1;
  const year = date.getFullYear();
  return `${year}${month}${day}${orderNumber}`;
}

export const getGeneratedFilenameByDate = (date, orderNumber) => {
  const day = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
  const month = (date.getMonth() + 1) < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1;
  const year = date.getFullYear();
  return `${year}-${month}-${day}-${orderNumber}`;
}
