import { renderer } from '..';
import { VerticalViewItem } from '../component/SplitView';
import { TITLEBAR_HEIGHT } from '../layout/MainLayout';
import { Part } from '../Part';
import { $ } from '../util/dom';
import { Menubar } from './Menubar';

export class TitlebarPart extends Part {

  maxResBtn: HTMLElement;

  constructor(parent: HTMLElement, id: string, role: string, classes: string[], options: object) {
    super(parent, id, role, classes, options);
    this.size = TITLEBAR_HEIGHT;
    // this.border = true;

    window.ipc.on('window state changed', (...args: any[]) => {
      // console.log('on window state changed is called ..');
      // console.log('args =', args);
      const arg = args[1];
      this.maxResBtn.classList.remove('codicon-chrome-restore', 'codicon-chrome-maximize');
      if(arg.isMaximized)
        this.maxResBtn.classList.add('codicon-chrome-restore');
      else
      this.maxResBtn.classList.add('codicon-chrome-maximize');
    });
  }

  override createContentArea(): HTMLElement {
    const container: HTMLElement = super.createContentArea();

    const menubar = $('.menubar');
    if(renderer.process.platform === 'darwin')
      menubar.style.paddingLeft = '80px';

    const left = $('.left');
    const _menubar = new Menubar(left);
    _menubar.install();
    menubar.appendChild(left);

    const middle = $('.middle');
    const handleMaxOrRes = async (e) => {
      const isMaximized = await window.ipc.invoke('window get', 'function', 'isMaximized');
      if(isMaximized)
        window.ipc.send('window fn', 'browserWindow', 'unmaximize');
      else
        window.ipc.send('window fn', 'browserWindow', 'maximize');
    }
    middle.addEventListener('dblclick', handleMaxOrRes);
    menubar.appendChild(middle);

    const right = $('.right');
    const minimizeBtn = $('a.codicon.codicon-chrome-minimize');
    minimizeBtn.addEventListener('click', () => {
      window.ipc.send('window fn', 'browserWindow', 'minimize');
    });

    const maxResBtn = this.maxResBtn = $('a.codicon');
    maxResBtn.classList.add('codicon-chrome-' + (renderer.window.isMaximized ? 'restore' : 'maximize'));
    maxResBtn.addEventListener('click', handleMaxOrRes);

    const closeBtn = $('a.codicon.codicon-chrome-close.close');
    closeBtn.addEventListener('click', () => {
      window.ipc.send('window fn', 'browserWindow', 'close');
    });

    right.appendChild(minimizeBtn);
    right.appendChild(maxResBtn);
    right.appendChild(closeBtn);
    menubar.appendChild(right);

    if(renderer.process.platform === 'darwin') {
      left.style.display = 'none';
      right.style.display = 'none';
      const title = $('.title');
      title.innerHTML = renderer.package_json.name;
      middle.appendChild(title);
    }

    container.appendChild(menubar);
    return container;
  }

}