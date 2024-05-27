import { I18N, LocaleName } from "../common/i18n";

let _locale = localStorage.getItem('locale') as LocaleName | undefined;
export const locale = _locale || 'en';
export const i18n = new I18N(locale);
export const lang = i18n.lang;
export const terminals: { [key: string]: any } = {};
