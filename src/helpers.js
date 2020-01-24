export function delay(ms) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
}

export const camelize = str => {
  // return removeDiacritics(str.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase()));

  const string = removeDiacritics(str);
  return string.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase())
};

export const removeDiacritics = str => {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
};
