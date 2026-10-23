import electron from 'electron';
import path from 'path';
import { DialogService } from '../../common/service/DialogService';
import { Queue } from '../../common/base/async';
import { massageMessageBoxOptions } from '../../common/base/dialogs';

export class MainDialogService implements DialogService {

  private readonly windowDialogQueues = new Map<number, Queue>();
  private readonly noWindowDialogQueue = new Queue();

  /**
   * 다이얼로그는 modal 이므로 window 별로 큐를 두어 하나가 닫힌 뒤에
   * 다음 것이 열리도록 한다.
   */
  private getWindowDialogQueue(window?: electron.BrowserWindow): Queue {
    if (!window) {
      return this.noWindowDialogQueue;
    }

    let windowDialogQueue = this.windowDialogQueues.get(window.id);
    if (!windowDialogQueue) {
      windowDialogQueue = new Queue();
      this.windowDialogQueues.set(window.id, windowDialogQueue);
    }

    return windowDialogQueue;
  }

  showMessageBox(rawOptions: electron.MessageBoxOptions, window?: electron.BrowserWindow): Promise<electron.MessageBoxReturnValue> {
    return this.getWindowDialogQueue(window).queue(async () => {
      const { options, buttonIndeces } = massageMessageBoxOptions(rawOptions, electron.app.getName());

      const result = window
        ? await electron.dialog.showMessageBox(window, options)
        : await electron.dialog.showMessageBox(options);

      return {
        response: buttonIndeces[result.response],
        checkboxChecked: result.checkboxChecked
      };
    });
  }

  /**
   * defaultPath 가 파일 이름만 있으면 문서 폴더 기준으로 만든다.
   * window 를 주지 않으면 포커스된 창에 modal 로 띄운다.
   */
  showSaveDialog(options: electron.SaveDialogOptions, window?: electron.BrowserWindow): Promise<electron.SaveDialogReturnValue> {
    const _window = window ?? electron.BrowserWindow.getFocusedWindow();
    return this.getWindowDialogQueue(_window).queue(async () => {
      const _options = { ...options };
      if (_options.defaultPath && !path.isAbsolute(_options.defaultPath))
        _options.defaultPath = path.join(electron.app.getPath('documents'), _options.defaultPath);

      return _window
        ? electron.dialog.showSaveDialog(_window, _options)
        : electron.dialog.showSaveDialog(_options);
    });
  }
}
