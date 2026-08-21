import { isMacintosh, isWindows } from './platform';

/**
 * `&&` 로 표기된 니모닉을 OS 규칙에 맞게 변환한다.
 * (VSCode base/common/labels 의 mnemonicButtonLabel 이식)
 *
 * - macOS: 니모닉을 지원하지 않으므로 제거
 * - Windows: `&&` -> `&`, 리터럴 `&` -> `&&`
 * - Linux: `&&` -> `_`
 */
export function mnemonicButtonLabel(label: string): { readonly withMnemonic: string; readonly withoutMnemonic: string } {
  const withoutMnemonic = label.replace(/\(&&\w\)|&&/g, '');

  if (isMacintosh) {
    return { withMnemonic: withoutMnemonic, withoutMnemonic };
  }

  let withMnemonic: string;
  if (isWindows) {
    withMnemonic = label.replace(/&&|&/g, m => m === '&' ? '&&' : '&');
  } else {
    withMnemonic = label.replace(/&&/g, '_');
  }

  return { withMnemonic, withoutMnemonic };
}
