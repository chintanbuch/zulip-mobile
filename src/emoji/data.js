/* @flow strict-local */
import 'string.fromcodepoint'; // eslint-disable-line spellcheck/spell-checker

import type { ImageEmojiType } from '../types';
import { objectFromEntries } from '../jsBackport';
import { unicodeCodeByName, override } from './codePointMap';

const unicodeEmojiNames = Object.keys(unicodeCodeByName);

const parseUnicodeEmojiCode = (code: string): string /* force line */ =>
  code
    .split('-')
    .map(hex => String.fromCodePoint(parseInt(hex, 16)))
    .join('');

export const nameToEmojiMap = objectFromEntries<string, string>(
  unicodeEmojiNames.map(name => [name, parseUnicodeEmojiCode(unicodeCodeByName[name])]),
);

export const codeToEmojiMap = objectFromEntries<string, string>(
  unicodeEmojiNames.map(name => {
    const code = unicodeCodeByName[name];
    const displayCode = override[code] || code;
    return [code, parseUnicodeEmojiCode(displayCode)];
  }),
);

/**
 * Names of all emoji matching the query, in an order to offer to the user.
 */
export const getFilteredEmojiNames = (
  query: string,
  activeImageEmojiByName: $ReadOnly<{ [string]: ImageEmojiType }>,
): string[] => {
  // Map from emoji names to 0 for prefix matches, 1 for others.
  // (Nonmatching names are excluded.)
  const nameMap: Map<string, number> = new Map(
    [...unicodeEmojiNames, ...Object.keys(activeImageEmojiByName)]
      .map(x => [x, Math.min(1, x.indexOf(query))])
      .filter(([_, i]) => i !== -1),
  );

  const emoji = Array.from(nameMap.keys()).sort((a, b) => {
    // `.get` will never return `undefined` here, but Flow doesn't know that
    const n = +nameMap.get(a) - +nameMap.get(b);
    // Prefix matches first, then non-prefix, each in lexicographic order.
    return n !== 0 ? n : a < b ? -1 : 1;
  });

  return emoji;
};
