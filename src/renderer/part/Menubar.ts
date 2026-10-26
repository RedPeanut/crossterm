// import { renderer } from "..";
import { SerializableMenuItem } from "../../common/Types";
import { CommandService } from "../service/CommandService";
import { Service, setService, getService, menubarServiceId,
  commandServiceId,
  keybindingServiceId,
  contextKeyServiceId,
} from "../Service";
import { KeybindingService } from "../service/KeybindingService";
import { ContextKeyService } from "../service/ContextKeyService";
import { $, Dimension, _addEventListener } from "../util/dom";
import { Disposable, DisposableStore } from '../../common/base/lifecycle';
import { MenuId, menuRegistry, resolveMenu } from "../menu/MenuRegistry";

enum MenubarType {
  Normal,
  Hamburger,
}

/** context 변경이 몰려 올 때 한 번만 다시 그리도록 모으는 시간(ms). */
const MENUBAR_UPDATE_DELAY = 100;

export interface MenubarService extends Service {
  layout(dimension: Dimension): void;
  // enable(arg: MenubarEnableElem[]): void;
}

export interface MenubarOptions {}

/**
 * 메뉴바 컨트롤. VSCode의 `CustomMenubarControl` + `NativeMenubarControl` 역할을 같이 한다.
 *
 *   MenuRegistry --resolveMenu--> SerializableMenuItem[]
 *     -> UI 메뉴바(normal / hamburger)로 렌더링
 *     -> 'menubar update' 로 main에 보내 네이티브 메뉴로 빌드 (mac)
 *
 * 메뉴 등록 변경, context 변경이 오면 다시 resolve 한다.
 */
export class Menubar extends Disposable implements MenubarService {

  container: HTMLElement;
  normalButtons: HTMLElement[] = [];
  hamburgerButton: HTMLElement;
  menubarType: MenubarType;
  dimension: Dimension | undefined;
  commandService: CommandService;
  keybindingService: KeybindingService;
  contextKeyService: ContextKeyService;

  /** 렌더링할 때마다 새로 만드는 메뉴 항목 DOM의 리스너 */
  renderDisposables: DisposableStore | undefined;
  updateTimer: ReturnType<typeof setTimeout> | undefined;
  /** 마지막으로 main에 보낸 메뉴 (JSON). 같으면 다시 보내지 않는다. */
  lastNativeMenu: string | undefined;

  constructor(container: HTMLElement) {
    super();
    this.container = container;

    this.container.tabIndex = -1;
    this._register(_addEventListener(container, 'keydown', (e: KeyboardEvent) => {
      console.log('e.key =', e.key);

    }));
    /* this._register(_addEventListener(container, 'focusin', (e: KeyboardEvent) => {
      console.log('focusin is called ..');
    })); */
    this._register(_addEventListener(container, 'focusout', (e: FocusEvent) => {
      // console.log('focusout is called ..');
      if (this.menubarType === MenubarType.Hamburger) {
        this.hamburgerButton.classList.remove('on');
      } else {
        for (let i = 0; i < this.normalButtons.length; i++) {
          this.normalButtons[i].classList.remove('on')
        }
      }
    }));

    /* this._register(_addEventListener(window, 'mousedown', (e) => {
      console.log('mousedown is called ..');
    })); */
    setService(menubarServiceId, this);
    this.commandService = getService(commandServiceId);
    this.keybindingService = getService(keybindingServiceId);
    this.contextKeyService = getService(contextKeyServiceId);

    this._register(menuRegistry.onDidChangeMenu(() => this.scheduleUpdate()));
    this._register(this.contextKeyService.onDidChangeContext(() => this.scheduleUpdate()));
  }

  layout(dimension: Dimension): void {
    // console.log('dimension =', dimension);
    this.dimension = dimension;
    this.applyLayout();
  }

  applyLayout(): void {
    if (!this.dimension) return;

    if (this.dimension.width <= 716) {
      this.hamburgerButton.style.display = 'flex';
      for (let i = 0; i < this.normalButtons.length; i++) {
        this.normalButtons[i].classList.remove('on');
        this.normalButtons[i].style.display = 'none';
      }
      this.menubarType = MenubarType.Hamburger;
    } else {
      this.hamburgerButton.classList.remove('on');
      this.hamburgerButton.style.display = 'none';
      for (let i = 0; i < this.normalButtons.length; i++) {
        // this.buttons[i].classList.remove('on')
        this.normalButtons[i].style.display = 'block';
      }
      this.menubarType = MenubarType.Normal;
    }
  }

  /*install(): void {
    this.createHamburgerMenu(this.container);
    this.createNormalMenu(this.container);
    // this.parent.appendChild(this.container);
  }

  symbolizeShrtcut(name: string): string {
    if (renderer.process.platform !== 'darwin')
      return name;

    name = name.replace('Left', '◀');
    name = name.replace('Right', '▶');
    name = name.replace('Up', '▲');
    name = name.replace('Down', '▼');
    name = name.replace('Ctrl', '⌃');
    name = name.replace('Alt', '⌥');
    name = name.replace('Shift', '⇧');
    name = name.replace('Cmd', '⌘');
    // name = name.replace('Fn', '');
    name = name.replace('Tab', '⇥');
    name = name.replace('Delete', '⌫');
    name = name.replace('Escape', '⎋');
    name = name.replace(/\+/g, '')
    return name;
  }

  normalizeShortcut(name: string): string {
    let parts = name.split(/\+(?!$)/);
    name = parts[parts.length - 1];
    let alt, ctrl, shift, cmd;
    for (let i = 0; i < parts.length - 1; i++) {
      let mod = parts[i];
      if (/^(cmd|meta|m)$/i.test(mod)) cmd = true;
      else if (/^a(lt)?$/i.test(mod)) alt = true;
      else if (/^(c|ctrl|control)$/i.test(mod)) ctrl = true;
      else if (/^s(hift)?$/i.test(mod)) shift = true;
      else throw new Error("Unrecognized modifier name: " + mod);
    }
    if (cmd) name = "Cmd+" + name;
    if (shift) name = "Shift+" + name;
    if (alt) name = "Alt+" + name;
    if (ctrl) name = "Ctrl+" + name;
    return name
  }*/

  install(): void {
    const button = this.hamburgerButton = $('.button.hamburger');
    this._register(_addEventListener(button, 'click', (e) => {
      (e.currentTarget as HTMLElement).classList.toggle('on');
    }));
    button.appendChild($('.title.codicon.codicon-menu'));
    this.container.appendChild(button);

    this.update();
  }

  scheduleUpdate(): void {
    if (this.updateTimer !== undefined) return;
    this.updateTimer = setTimeout(() => {
      this.updateTimer = undefined;
      this.update();
    }, MENUBAR_UPDATE_DELAY);
  }

  update(): void {
    const menu = resolveMenu(MenuId.MenubarMainMenu, this.contextKeyService.getContext(),
      commandId => this.keybindingService.lookupKeybindingAccelerator(commandId));
    this.render(menu);
    this.updateNativeMenubar(menu);
  }

  updateNativeMenubar(menu: SerializableMenuItem[]): void {
    const serialized = JSON.stringify(menu);
    if (serialized === this.lastNativeMenu) return;
    this.lastNativeMenu = serialized;
    window.ipc.send('menubar update', menu);
  }

  /** 다시 그려도 열려 있던 메뉴는 열린 채로 둔다. (메뉴를 여는 순간 focus가 바뀌어 context 변경이 오기 때문) */
  render(menu: SerializableMenuItem[]): void {
    const openMenuId = this.normalButtons.find(button => button.classList.contains('on'))?.dataset.menuId;

    this.renderDisposables?.dispose();
    this.renderDisposables = new DisposableStore();

    this.hamburgerButton.querySelector(':scope > ul.menubox')?.remove();
    this.normalButtons.forEach(button => button.remove());
    this.normalButtons = [];

    this.createHamburgerMenu(menu);
    this.createNormalMenu(menu);
    this.applyLayout();

    if (openMenuId)
      this.normalButtons.find(button => button.dataset.menuId === openMenuId)?.classList.add('on');
  }

  /*
  createMenu_r(type: string, container: HTMLElement, menuItem: SerializableMenuItem, level: number): void {
    const menubox = $('ul.menubox');
    if (level > 0) menubox.classList.add('sub');

    for (let i = 0; i < menuItem.submenu.length; i++) {
      const submenuItem = menuItem.submenu[i];
      const li = $('li.item');
      if (submenuItem.id) {
        if (type === 'hamburger')
          li.id = `h_${(submenuItem.id as string).replace(/\./g, '_')}`;
        else // if (type === 'normal')
          li.id = `n_${(submenuItem.id as string).replace(/\./g, '_')}`;
      }

      if (!submenuItem.enabled)
        li.classList.add('disabled');

      if (submenuItem.type === 'separator') {
        const a = $('a');
        a.classList.add('separator');
        li.appendChild(a);
      } else {
        // this._register(_addEventListener(li, 'mouseover', (e) => {}));
        // this._register(_addEventListener(li, 'mouseleave', (e) => {}));
        // this._register(_addEventListener(li, 'focusout', (e) => {}));

        const a = $('a');

        if (submenuItem.enabled && submenuItem.clickable && submenuItem.commandId) {
          const commandId = submenuItem.commandId;
          this._register(_addEventListener(a, 'click', () => {
            this.commandService.executeCommand(commandId)
              .catch (err => console.error(`[menubar] command '${commandId}' failed`, err));
          }));
        }
        li.appendChild(a);

        const label = $('span.label');
        label.innerHTML = submenuItem.label.replace(/&/g, '');
        a.appendChild(label);

        const padding = $('span.padding');
        a.appendChild(padding);

        if (submenuItem.accelerator) {
          const keybiding = $('span.keybinding');
          keybiding.innerHTML = this.symbolizeShrtcut(this.normalizeShortcut(submenuItem.accelerator));
          // keybiding.innerHTML = this.keybindingService.lookupKeybindingLabel(submenuItem.commandId) ?? '';
          a.appendChild(keybiding);
        }

        if (submenuItem.submenu && submenuItem.submenu.length > 0) {
          const indicator = $('span.indicator.codicon.codicon-chevron-right');
          a.appendChild(indicator);
          this.createMenu_r(type, li, submenuItem, level+1);
        }
      }
      menubox.appendChild(li);
    }
    container.appendChild(menubox);
  }
  //*/

  createMenu_r(container: HTMLElement, items: SerializableMenuItem[], level: number): void {
    const store = this.renderDisposables!;
    const menubox = $('ul.menubox');
    if (level > 0) menubox.classList.add('sub');

    for (const item of items) {
      const li = $('li.item');

      if (!item.enabled)
        li.classList.add('disabled');

      if (item.type === 'separator') {
        const a = $('a');
        a.classList.add('separator');
        li.appendChild(a);
      } else {
        const a = $('a');

        if (item.enabled && item.clickable && item.commandId) {
          const commandId = item.commandId;
          store.add(_addEventListener(a, 'click', () => {
            this.commandService.executeCommand(commandId)
              .catch (err => console.error(`[menubar] command '${commandId}' failed`, err));
          }));
        }
        li.appendChild(a);

        if (item.checked)
          li.classList.add('checked');

        const label = $('span.label');
        label.innerHTML = item.label.replace(/&/g, '');
        a.appendChild(label);

        const padding = $('span.padding');
        a.appendChild(padding);

        // accelerator(Electron 형식)는 chord를 표현하지 못하므로 UI에는 키바인딩 라벨을 쓴다. 예: '⌘K ⌘S'
        const keybindingLabel = item.commandId && this.keybindingService.lookupKeybindingLabel(item.commandId);
        if (keybindingLabel) {
          const keybiding = $('span.keybinding');
          keybiding.innerHTML = keybindingLabel;
          a.appendChild(keybiding);
        }

        if (item.submenu && item.submenu.length > 0) {
          const indicator = $('span.indicator.codicon.codicon-chevron-right');
          a.appendChild(indicator);
          this.createMenu_r(li, item.submenu, level+1);
        }
      }
      menubox.appendChild(li);
    }
    container.appendChild(menubox);
  }

  /*
  async createHamburgerMenu(container: HTMLElement) {
    const button = this.hamburgerButton = $('.button.hamburger');
    this._register(_addEventListener(button, 'click', (e) => {
      // console.log('e.target =', e.target);
      (e.currentTarget as HTMLElement).classList.toggle('on');
    }));

    const title = $('.title.codicon.codicon-menu');
    button.appendChild(title);
    // container.appendChild(button);

    const menu = await window.ipc.invoke('menu get');

    const menubox = $('ul.menubox');
    for (let i = 0; i < menu.length; i++) {
      const menuItem = menu[i];
      const li = $('li.item');
      if (menuItem.id) li.id = `h_${(menuItem.id as string).replace(/\./g, '_')}`;

      if (menuItem.type === 'separator') {
        const a = $('a');
        a.classList.add('separator');
        li.appendChild(a);
      } else {
        this._register(_addEventListener(li, 'mouseover', (e) => { (e.currentTarget as HTMLElement).classList.add('on');  }));
        this._register(_addEventListener(li, 'mouseleave', (e) => { (e.currentTarget as HTMLElement).classList.remove('on'); }));
        this._register(_addEventListener(li, 'focusout', (e) => { (e.currentTarget as HTMLElement).classList.remove('on'); }));

        const a = $('a');
        li.appendChild(a);

        const label = $('span.label');
        label.innerHTML = menuItem.label.replace(/&/g, '');
        a.appendChild(label);

        const padding = $('span.padding');
        a.appendChild(padding);

        if (menuItem.submenu && menuItem.submenu.length > 0) {
          const indicator = $('span.indicator.codicon.codicon-chevron-right');
          a.appendChild(indicator);
          this.createMenu_r('hamburger', li, menuItem, 1);
        }
      }
      menubox.appendChild(li);
    }
    button.appendChild(menubox);
    container.appendChild(button);
  }
  //*/

  createHamburgerMenu(menu: SerializableMenuItem[]): void {
    const store = this.renderDisposables!;
    const menubox = $('ul.menubox');
    for (const menuItem of menu) {
      const li = $('li.item');

      if (menuItem.type === 'separator') {
        const a = $('a');
        a.classList.add('separator');
        li.appendChild(a);
      } else {
        store.add(_addEventListener(li, 'mouseover', (e) => { (e.currentTarget as HTMLElement).classList.add('on');  }));
        store.add(_addEventListener(li, 'mouseleave', (e) => { (e.currentTarget as HTMLElement).classList.remove('on'); }));
        store.add(_addEventListener(li, 'focusout', (e) => { (e.currentTarget as HTMLElement).classList.remove('on'); }));

        const a = $('a');
        li.appendChild(a);

        const label = $('span.label');
        label.innerHTML = menuItem.label.replace(/&/g, '');
        a.appendChild(label);

        const padding = $('span.padding');
        a.appendChild(padding);

        if (menuItem.submenu && menuItem.submenu.length > 0) {
          const indicator = $('span.indicator.codicon.codicon-chevron-right');
          a.appendChild(indicator);
          this.createMenu_r(li, menuItem.submenu, 1);
        }
      }
      menubox.appendChild(li);
    }
    this.hamburgerButton.appendChild(menubox);
  }

  /*async createNormalMenu(container: HTMLElement) {
    const menu = await window.ipc.invoke('menu get');
    for (let i = 0; i < menu.length; i++) {
      const menuItem = menu[i];
      // console.log('['+index+']', menuItem);
      const button = $('.button');
      this.normalButtons.push(button);

      // button.innerHTML = item.label.replace(/&/g, '');
      this._register(_addEventListener(button, 'click', (e) => {
        // console.log('e.target =', e.target);
        (e.currentTarget as HTMLElement).classList.toggle('on');
      }));

      this._register(_addEventListener(button, 'mouseover', (e) => {
        // if there is any menu on-ed (clicked) → change on
        let i, b = false;
        for (i = 0; i < this.normalButtons.length; i++) {
          if (this.normalButtons[i].classList.contains('on')) {
            b = true; break;
          }
        }

        if (b) {
          this.normalButtons[i].classList.remove('on');
          (e.currentTarget as HTMLElement).classList.toggle('on');
        }
      }));
      this._register(_addEventListener(button, 'mouseout', (e) => {}));
      // this._register(_addEventListener(button, 'keydown', (e) => {}));

      const title = $('.title');
      title.innerHTML = menuItem.label.replace(/&/g, '');
      button.appendChild(title);

      this.createMenu_r('normal', button, menuItem, 0);
      container.appendChild(button);
    }
  }*/

  createNormalMenu(menu: SerializableMenuItem[]): void {
    const store = this.renderDisposables!;
    for (const menuItem of menu) {
      const button = $('.button');
      button.dataset.menuId = String(menuItem.id);
      this.normalButtons.push(button);

      store.add(_addEventListener(button, 'click', (e) => {
        (e.currentTarget as HTMLElement).classList.toggle('on');
      }));

      store.add(_addEventListener(button, 'mouseover', (e) => {
        // if there is any menu on-ed (clicked) → change on
        const opened = this.normalButtons.find(b => b.classList.contains('on'));
        if (opened && opened !== e.currentTarget) {
          opened.classList.remove('on');
          (e.currentTarget as HTMLElement).classList.add('on');
        }
      }));

      const title = $('.title');
      title.innerHTML = menuItem.label.replace(/&/g, '');
      button.appendChild(title);

      this.createMenu_r(button, menuItem.submenu ?? [], 0);
      this.container.appendChild(button);
    }
  }

  override dispose(): void {
    if (this.updateTimer !== undefined) clearTimeout(this.updateTimer);
    this.renderDisposables?.dispose();
    super.dispose();
  }

  /*enable(list: MenubarEnableElem[]): void {
    for (let i = 0; i < list.length; i++) {
      const item = list[i];
      const queried = this.hamburgerButton.querySelector(`#h_${item.id.replace(/\./g, '_')}`);
      if (queried) {
        // console.log('find!!');
        if (!item.enable)
          queried.classList.add('disabled');
        else
          queried.classList.remove('disabled');
      }
    }

    for (let i = 0; i < list.length; i++) {
      const item = list[i];
      for (let j = 0; j < this.normalButtons.length; j++) {
        let queried = this.normalButtons[j].querySelector(`#n_${item.id.replace(/\./g, '_')}`);
        if (queried) {
          // console.log('find!!');
          if (!item.enable)
            queried.classList.add('disabled');
          else
            queried.classList.remove('disabled');
          break;
        }
      }
    }
  }*/
}
