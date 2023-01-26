import _ from 'lodash';

const excludeList = ['i', 'a', 'per', 'pel', 'pels', 'al', 'de', 'dels', 'la', 'les', 'el', 'els'];

export const representsANumber = word => /^i+l*$|^l+i*$|\d/i.test(word);

export const abreviate = words => {
  if (words.length < 3) {
    const abv = _.capitalize(words[0].substring(0, 3));

    if (words.length === 2 && representsANumber(words[1])) {
      return `${abv} ${words[1].toUpperCase().replace('L', 'I')}`;
    }
  }

  return words
    .reduce((accum, word) => {
      if (excludeList.includes(word)) {
        return accum;
      }

      if (representsANumber(word)) {
        return `${accum} ${word.toUpperCase().replace('L', 'I')}`;
      }

      return `${accum}${_.capitalize(word.substring(0, words.length > 1 ? 1 : 3))}`;
    }, '')
    .trim();
};
