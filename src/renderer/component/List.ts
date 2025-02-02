import { TerminalItem } from "../../common/Types";
import { wrapper } from "../../globals";
import { BodyLayoutService } from "../layout/BodyLayout";
import { SessionPartService } from "../part/SessionPart";
import { bodyLayoutServiceId, getService, sessionPartServiceId } from "../Service";
import { $, append } from "../util/dom";
import { findActiveItem } from "../utils";
import { ListItem } from "./ListItem";
import { Tree } from "./Tree";
import { v4 as uuidv4 } from 'uuid';

export type ListItemType = 'local' | 'remote' | 'group' | 'folder';
export type FolderModeType = 0 | 1 | 2; // 0: 기본값; 1: 단일 선택 2: 다중 선택

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
  state: {
    selectedIds: string[],
    showList: ListItemElem[],
  };

  tree: Tree;

  constructor(container: HTMLElement) {
    this.container = container;
    this.state = {
      selectedIds: [],
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
          // isCollapsed: false
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

  flatten(list: ListItemElem[]): ListItemElem[] {
    let new_list: ListItemElem[] = [];
    list.map((item) => {
      new_list.push(item);
      if(item.children) {
        new_list = [...new_list, ...this.flatten(item.children)];
      }
    });
    return new_list;
  }

  onDoubleClick(id: string): void {
    // console.log('onDoubleClick() is called..., id =', id);
    const { showList } = this.state;
    const item: ListItemElem | undefined = this.flatten(showList).find((item) => item.id === id);

    const new_one: TerminalItem = {
      // type: item?.type, size: { row: 24, col: 80 },
      type: item.type, size: item.size, url: item.url,
      uid: uuidv4(), selected: true, active: true,
    };

    // find active item position first
    const find_active = findActiveItem(wrapper.tree, 0, []);
    // console.log('find_active =', find_active);

    // let new_tree;
    if(find_active) {
      const { depth, index, pos, item: activeItem, group: activeGroup, splitItem } = find_active;

      // turn off active item
      activeItem.selected = false;
      activeItem.active = false;

      // attach backward
      activeGroup.push(new_one);
    } else {
      wrapper.tree.list = [ [new_one] ];
    }

    const bodyLayoutService: BodyLayoutService = getService(bodyLayoutServiceId);
    bodyLayoutService.recreate();
    bodyLayoutService.layout(0, 0);

    const sessionPartService: SessionPartService = getService(sessionPartServiceId);
    sessionPartService.getServices();
    sessionPartService.createTerminal();
  }

  create(): void {
    this.element = $('.list');
    const tree = this.tree = new Tree(this.element);
    tree.create(
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
        return listItem.create(data);
      }, // nodeRender: (data: ListItemElem) => HTMLElement | null
      this.onDoubleClick.bind(this) // (id: string) => void
    );
    append(this.container, this.element);
  }
}