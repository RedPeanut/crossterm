import { renderer } from "..";
import { SerializableMenuItem, MenubarEnableElem } from "../../common/Types";
import { Service, setService, menubarServiceId } from "../Service";
import { $, Dimension } from "../util/dom";

enum MenubarType {
  Normal,
  Hamburger,
}

export interface MenubarService extends Service {
  layout(dimension: Dimension): void;
  enable(arg: MenubarEnableElem[]): void;
}

export interface MenubarOptions {}

export class Menubar implements MenubarService {

  container: HTMLElement;
  normalButtons: HTMLElement[] = [];
  hamburgerButton: HTMLElement;
  menubarType: MenubarType;

  constructor(container: HTMLElement) {
    this.container = container;

    this.container.tabIndex = -1;
    container.addEventListener('keydown', (e: KeyboardEvent) => {
      console.log('e.key =', e.key);

    });
    /* container.addEventListener('focusin', (e: KeyboardEvent) => {
      console.log('focusin is called ..');
    }); */
    container.addEventListener('focusout', (e: FocusEvent) => {
      // console.log('focusout is called ..');
      if(this.menubarType === MenubarType.Hamburger) {
        this.hamburgerButton.classList.remove('on');
      } else {
        for(let i = 0; i < this.normalButtons.length; i++) {
          this.normalButtons[i].classList.remove('on')
        }
      }
    });

    /* window.addEventListener('mousedown', (e) => {
      console.log('mousedown is called ..');
    }); */
    setService(menubarServiceId, this);
  }

  layout(dimension: Dimension): void {
    // console.log('dimension =', dimension);
    if(dimension.width <= 716) {
      this.hamburgerButton.style.display = 'flex';
      for(let i = 0; i < this.normalButtons.length; i++) {
        this.normalButtons[i].classList.remove('on');
        this.normalButtons[i].style.display = 'none';
      }
      this.menubarType = MenubarType.Hamburger;
    } else {
      this.hamburgerButton.classList.remove('on');
      this.hamburgerButton.style.display = 'none';
      for(let i = 0; i < this.normalButtons.length; i++) {
        // this.buttons[i].classList.remove('on')
        this.normalButtons[i].style.display = 'block';
      }
      this.menubarType = MenubarType.Normal;
    }
  }

  install(): void {
    this.createHamburgerMenu(this.container);
    this.createNormalMenu(this.container);
    // this.parent.appendChild(this.container);
  }

  symbolizeShrtcut(name: string): string {
    if(renderer.process.platform !== 'darwin')
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
    for(let i = 0; i < parts.length - 1; i++) {
      let mod = parts[i];
      if (/^(cmd|meta|m)$/i.test(mod)) cmd = true;
      else if (/^a(lt)?$/i.test(mod)) alt = true;
      else if (/^(c|ctrl|control)$/i.test(mod)) ctrl = true;
      else if (/^s(hift)?$/i.test(mod)) shift = true;
      else throw new Error("Unrecognized modifier name: " + mod);
    }
    if(cmd) name = "Cmd+" + name;
    if(shift) name = "Shift+" + name;
    if(alt) name = "Alt+" + name;
    if(ctrl) name = "Ctrl+" + name;
    return name
  }

  createMenu_r(type: string, container: HTMLElement, menuItem: SerializableMenuItem, level: number): void {
    const menubox = $('ul.menubox');
    if(level > 0) menubox.classList.add('sub');

    for(let i = 0; i < menuItem.submenu.length; i++) {
      const submenuItem = menuItem.submenu[i];
      const li = $('li.item');
      if(submenuItem.id) {
        if(type === 'hamburger')
          li.id = `h_${(submenuItem.id as string).replace(/\./g, '_')}`;
        else // if(type === 'normal')
          li.id = `n_${(submenuItem.id as string).replace(/\./g, '_')}`;
      }

      if(!submenuItem.enabled)
        li.classList.add('disabled');

      if(submenuItem.type === 'separator') {
        const a = $('a');
        a.classList.add('separator');
        li.appendChild(a);
      } else {
        // li.addEventListener('mouseover', (e) => {});
        // li.addEventListener('mouseleave', (e) => {});
        // li.addEventListener('focusout', (e) => {});

        const a = $('a');

        if(submenuItem.enabled && submenuItem.clickable && submenuItem.id) {
          a.addEventListener('click', () => {
            // broadcast.emit('menu click', null, submenuItem.id);
          });
        }
        li.appendChild(a);

        const label = $('span.label');
        label.innerHTML = submenuItem.label.replace(/&/g, '');
        a.appendChild(label);

        const padding = $('span.padding');
        a.appendChild(padding);

        if(submenuItem.accelerator) {
          const keybiding = $('span.keybinding');
          keybiding.innerHTML = this.symbolizeShrtcut(this.normalizeShortcut(submenuItem.accelerator));
          a.appendChild(keybiding);
        }

        if(submenuItem.submenu && submenuItem.submenu.length > 0) {
          const indicator = $('span.indicator.codicon.codicon-chevron-right');
          a.appendChild(indicator);
          this.createMenu_r(type, li, submenuItem, level+1);
        }
      }
      menubox.appendChild(li);
    }
    container.appendChild(menubox);
  }

  async createHamburgerMenu(container: HTMLElement) {
    const button = this.hamburgerButton = $('.button.hamburger');
    button.addEventListener('click', (e) => {
      // console.log('e.target =', e.target);
      (e.currentTarget as HTMLElement).classList.toggle('on');
    });

    const title = $('.title.codicon.codicon-menu');
    button.appendChild(title);
    // container.appendChild(button);

    const menu = await window.ipc.invoke('menu get');

    const menubox = $('ul.menubox');
    for(let i = 0; i < menu.length; i++) {
      const menuItem = menu[i];
      const li = $('li.item');
      if(menuItem.id) li.id = `h_${(menuItem.id as string).replace(/\./g, '_')}`;

      if(menuItem.type === 'separator') {
        const a = $('a');
        a.classList.add('separator');
        li.appendChild(a);
      } else {
        li.addEventListener('mouseover', (e) => { (e.currentTarget as HTMLElement).classList.add('on');  });
        li.addEventListener('mouseleave', (e) => { (e.currentTarget as HTMLElement).classList.remove('on'); });
        li.addEventListener('focusout', (e) => { (e.currentTarget as HTMLElement).classList.remove('on'); });

        const a = $('a');
        li.appendChild(a);

        const label = $('span.label');
        label.innerHTML = menuItem.label.replace(/&/g, '');
        a.appendChild(label);

        const padding = $('span.padding');
        a.appendChild(padding);

        if(menuItem.submenu && menuItem.submenu.length > 0) {
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

  async createNormalMenu(container: HTMLElement) {
    const menu = await window.ipc.invoke('menu get');
    for(let i = 0; i < menu.length; i++) {
      const menuItem = menu[i];
      // console.log('['+index+']', menuItem);
      const button = $('.button');
      this.normalButtons.push(button);

      // button.innerHTML = item.label.replace(/&/g, '');
      button.addEventListener('click', (e) => {
        // console.log('e.target =', e.target);
        (e.currentTarget as HTMLElement).classList.toggle('on');
      });

      button.addEventListener('mouseover', (e) => {
        // if there is any menu on-ed (clicked) → change on
        let i, b = false;
        for(i = 0; i < this.normalButtons.length; i++) {
          if(this.normalButtons[i].classList.contains('on')) {
            b = true; break;
          }
        }

        if(b) {
          this.normalButtons[i].classList.remove('on');
          (e.currentTarget as HTMLElement).classList.toggle('on');
        }
      });
      button.addEventListener('mouseout', (e) => {});
      // button.addEventListener('keydown', (e) => {});

      const title = $('.title');
      title.innerHTML = menuItem.label.replace(/&/g, '');
      button.appendChild(title);

      this.createMenu_r('normal', button, menuItem, 0);
      container.appendChild(button);
    }
  }

  enable(list: MenubarEnableElem[]): void {
    for(let i = 0; i < list.length; i++) {
      const item = list[i];
      const quired = this.hamburgerButton.querySelector(`#h_${item.id.replace(/\./g, '_')}`);
      if(quired) {
        // console.log('find!!');
        if(!item.enable)
          quired.classList.add('disabled');
        else
          quired.classList.remove('disabled');
      }
    }

    for(let i = 0; i < list.length; i++) {
      const item = list[i];
      for(let j = 0; j < this.normalButtons.length; j++) {
        let quired = this.normalButtons[j].querySelector(`#n_${item.id.replace(/\./g, '_')}`);
        if(quired) {
          // console.log('find!!');
          if(!item.enable)
            quired.classList.add('disabled');
          else
            quired.classList.remove('disabled');
          break;
        }
      }
    }
  }

}