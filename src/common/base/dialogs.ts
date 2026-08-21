import electron from 'electron';
import { deepClone } from './objects';
import { isLinux, isMacintosh, isWindows } from './platform';
import { mnemonicButtonLabel } from './labels';

export interface MassagedMessageBoxOptions {

  /**
   * OS 규칙에 맞게 보정된 메시지 박스 옵션.
   */
  readonly options: electron.MessageBoxOptions;

  /**
   * 버튼 순서가 OS 별로 재배치되기 때문에, 호출자에게는 원래 인덱스를
   * 돌려줘야 한다. 그 매핑 테이블.
   */
  readonly buttonIndeces: number[];
}

/**
 * 메시지 박스 옵션을 각 OS 의 HIG 에 맞게 보정한다.
 * (VSCode platform/dialogs/common/dialogs 의 massageMessageBoxOptions 이식,
 *  IProductService 대신 productName 을 직접 받는다)
 */
export function massageMessageBoxOptions(options: electron.MessageBoxOptions, productName: string): MassagedMessageBoxOptions {
  const massagedOptions = deepClone(options);

  let buttons = (massagedOptions.buttons ?? []).map(button => mnemonicButtonLabel(button).withMnemonic);
  let buttonIndeces = (options.buttons || []).map((button, index) => index);

  let defaultId = 0; // 기본적으로 첫번째 버튼이 default
  let cancelId = massagedOptions.cancelId ?? buttons.length - 1; // 기본적으로 마지막 버튼이 cancel

  // 버튼이 2개 이상일 때만 OS 별 HIG 적용
  if (buttons.length > 1) {
    const cancelButton = typeof cancelId === 'number' ? buttons[cancelId] : undefined;

    if (isLinux || isMacintosh) {

      // Linux(GNOME HIG): cancel 버튼이 항상 affirmative 버튼보다 앞(왼쪽)에 와야 한다.
      // macOS: 구버전에서는 cancel 이 default 버튼 왼쪽에 놓였으므로 Linux 와 동일하게 섞어준다.
      // Electron 은 버튼 순서를 대신 정렬해주지 않으므로 직접 처리한다.

      if (typeof cancelButton === 'string' && buttons.length > 1 && cancelId !== 1) {
        buttons.splice(cancelId, 1);
        buttons.splice(1, 0, cancelButton);

        const cancelButtonIndex = buttonIndeces[cancelId];
        buttonIndeces.splice(cancelId, 1);
        buttonIndeces.splice(1, 0, cancelButtonIndex);

        cancelId = 1;
      }

      if (isLinux && buttons.length > 1) {
        buttons = buttons.reverse();
        buttonIndeces = buttonIndeces.reverse();

        defaultId = buttons.length - 1;
        if (typeof cancelButton === 'string') {
          cancelId = defaultId - 1;
        }
      }
    } else if (isWindows) {

      // Windows(HIG): cancel 버튼이 마지막에 와야 한다.
      if (typeof cancelButton === 'string' && buttons.length > 1 && cancelId !== buttons.length - 1) {
        buttons.splice(cancelId, 1);
        buttons.push(cancelButton);

        const buttonIndex = buttonIndeces[cancelId];
        buttonIndeces.splice(cancelId, 1);
        buttonIndeces.push(buttonIndex);

        cancelId = buttons.length - 1;
      }
    }
  }

  massagedOptions.buttons = buttons;
  massagedOptions.defaultId = defaultId;
  massagedOptions.cancelId = cancelId;
  massagedOptions.noLink = true;
  massagedOptions.title = massagedOptions.title || productName;

  return {
    options: massagedOptions,
    buttonIndeces
  };
}
