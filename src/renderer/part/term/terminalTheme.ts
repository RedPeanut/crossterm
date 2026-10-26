import type { ITheme } from 'xterm';
import { Emitter, Event } from '../../../common/base/event';

/** xterm ITheme 키 -> theme.css 토큰 이름(--ct-...) */
const tokens: { [K in keyof ITheme]?: string } = {
  background: 'terminal-background',
  foreground: 'terminal-foreground',
  cursor: 'terminalCursor-foreground',
  cursorAccent: 'terminalCursor-background',
  selectionBackground: 'terminal-selectionBackground',
  black: 'terminal-ansiBlack',
  red: 'terminal-ansiRed',
  green: 'terminal-ansiGreen',
  yellow: 'terminal-ansiYellow',
  blue: 'terminal-ansiBlue',
  magenta: 'terminal-ansiMagenta',
  cyan: 'terminal-ansiCyan',
  white: 'terminal-ansiWhite',
  brightBlack: 'terminal-ansiBrightBlack',
  brightRed: 'terminal-ansiBrightRed',
  brightGreen: 'terminal-ansiBrightGreen',
  brightYellow: 'terminal-ansiBrightYellow',
  brightBlue: 'terminal-ansiBrightBlue',
  brightMagenta: 'terminal-ansiBrightMagenta',
  brightCyan: 'terminal-ansiBrightCyan',
  brightWhite: 'terminal-ansiBrightWhite',
};

/**
 * 지금 적용된 테마의 터미널 색을 xterm ITheme으로 돌려준다.
 * xterm은 css 변수를 읽지 못하므로, theme.css의 값을 computed style에서 꺼내 넘긴다.
 */
export function getTerminalTheme(): ITheme {
  const style = getComputedStyle(document.documentElement);
  return Object.fromEntries(
    Object.entries(tokens).map(([key, token]) => [key, style.getPropertyValue(`--ct-${token}`).trim()])
  );
}

const onDidChangeThemeEmitter = new Emitter<void>();

/**
 * <html data-theme>이 바뀌면 발생한다.
 * TODO: 테마 서비스(설정 연동)가 생기면 그쪽 이벤트로 옮긴다.
 */
export const onDidChangeTheme: Event<void> = onDidChangeThemeEmitter.event;

new MutationObserver(() => onDidChangeThemeEmitter.fire()).observe(document.documentElement, {
  attributes: true,
  attributeFilter: ['data-theme'],
});
