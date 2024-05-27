import en from './languages/en';
import ja from './languages/ja';
import ko from './languages/ko';
import { default as lang } from './languages/en';

export const languages = {
  en,
  ja,
  ko,
}

export type LocaleName = keyof typeof languages;
export type LanguageDict = typeof lang;
export type LanguageKey = keyof LanguageDict;

export class I18N {
  locale: LocaleName
  lang: LanguageDict

  constructor(locale: LocaleName = 'en') {
    this.locale = locale;
    const _this = this;
    this.lang = new Proxy(
      {},
      {
        get(obj, key: LanguageKey) {
          return _this.trans(key)
        },
      },
    ) as LanguageDict;
  }

  trans(key: LanguageKey, words?: string[]) {
    let lang = languages[this.locale];
    let s: string = '';

    if(key in lang) {
      s = lang[key].toString();
    }

    if(words) {
      words.map((w, idx) => {
        let reg = new RegExp(`\{\s*${idx}\s*}`)
        s = s.replace(reg, w);
      })
    }
    return s;
  }
}
