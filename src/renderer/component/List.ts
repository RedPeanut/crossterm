import { $, append } from "../util/dom";
import { ListItem } from "./ListItem";
import { Tree } from "./Tree";

export type ListItemType = 'local' | 'remote' | 'group' | 'folder';
export interface ListItemElem {
  type?: ListItemType;
  title?: string;
  id: string;
  children?: ListItemElem[];

  // remote
  url?: { host: string, port: number, username: string, password: string };
  size?: { row: number, col: number }

  // control
  canSelect?: boolean; // 선택 가능 여부, 기본값은 true
  canDrag?: boolean; // 드래그 가능 여부, 기본값은 true
  canDropBefore?: boolean; // 이전 드롭이 허용되는지 여부, 기본값은 true
  canDropIn?: boolean; // 드롭인 허용 여부, 기본값은 true
  canDropAfter?: boolean; // 이후 드롭을 허용할지 여부, 기본값은 true
  isCollapsed?: boolean;
}

export class List {
  container: HTMLElement;
  element: HTMLElement;
  // showList: ListItem[];
  state: any;

  constructor(container: HTMLElement) {
    this.container = container;
    this.state = {
      showList: [
        {
          type: 'folder',
          title: 'folder',
          id: '52528ee3-aa4f-44a5-b763-5cf69acacf51',
          children: [
            {
              id: 'e54af9c1-f003-4b1b-8db4-e796f69a9a4d',
              title: 'xyz',
              type: 'remote',
              url: {
                host: '192.168.0.25',
                port: 22,
                username: 'kimjk',
                password: '1234',
              },
              size: { row: 24, col: 80 }
            },
            {
              type: 'local',
              title: 'local',
              id: '96367ed9-6fb1-434b-b45d-de9d2d21898a',
            }
          ],
          isCollapsed: false
        },
        {
          type: 'remote',
          title: 'remote',
          // url: 'www.remote.com',
          id: '8d65f5a3-306d-44c7-a43f-b5abc17b6a2b',
        },
        /* {
          type: 'group',
          title: 'group',
          id: 'cbf8ea19-4474-4c15-8af0-3a4bdcdff717'
        }, */
        {
          type: 'local',
          title: 'local',
          id: '751b26d0-5c94-4328-a0e8-23fdd85d160f'
        }
      ]
    };
  }

  render(): void {
    this.element = $('.list');
    const tree = new Tree(this.element);
    tree.render(
      this.state.showList, // tree: ListItemElem[]
      this.state.selectedIds, // selectedIds: string[]
      (list: any) => {
        this.state = {
          ...this.state,
          showList: list
        };
      }, // onChange: (list: ListItemElem[]) => void
      (ids: string[]) => {
        this.state = {
          ...this.state,
          selectedIds: ids || ['0']
        };
      }, // onSelect: (ids: string[]) => void
      (data: ListItemElem) => { 
        const listItem = new ListItem(null);
        return listItem.render(data);
      }, // nodeRender: (data: ListItemElem) => HTMLElement | null
    );
    append(this.container, this.element);
  }
}