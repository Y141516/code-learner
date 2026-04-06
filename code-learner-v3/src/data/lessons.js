export { LANGUAGES, pythonLessons } from './lessonsData.js';
export { javascriptLessons, htmlcssLessons, fullstackLessons } from './lessonsData2.js';

import { pythonLessons } from './lessonsData.js';
import { javascriptLessons, htmlcssLessons, fullstackLessons } from './lessonsData2.js';

export const LESSONS = {
  python:     pythonLessons,
  javascript: javascriptLessons,
  htmlcss:    htmlcssLessons,
  fullstack:  fullstackLessons,
};

export function getTotalLessons(langId) {
  const lang = LESSONS[langId];
  if (!lang) return 0;
  return Object.values(lang).reduce((s, l) => s + l.length, 0);
}
