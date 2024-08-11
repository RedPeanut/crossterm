import { FlatItem } from 'renderer/Types';
import {
  DEFAULT_ACTIVE_SIDE_BAR_ICON,
  DEFAULT_SIDE_PANEL_WIDTH,
} from '../../Constants';

/* types */
export const SET_SCREEN = 'SET_SCREEN';
export const GET_SCREEN = 'GET_SCREEN';
export const SET_SIDE_PANEL = 'SET_SIDE_PANEL';
export const GET_SIDE_PANEL = 'GET_SIDE_PANEL';
export const SET_DROP_OVERLAY = 'SET_DROP_OVERLAY';
export const GET_DROP_OVERLAY = 'GET_DROP_OVERLAY';
export const SET_LIST = 'SET_LIST';
export const GET_LIST = 'GET_LIST';
export const SET_TREE = 'SET_TREE';
export const GET_TREE = 'GET_TREE';
export const SET_ADD = 'SET_ADD';
export const GET_ADD = 'GET_ADD';

/* action creator */
export function setScreen(_v: {}) {
  return { type: SET_SCREEN, v: _v };
}

export function setSidePanel(_v: {}) {
  return { type: SET_SIDE_PANEL, v: _v };
}

export function setDropOverlay(_v: {}) {
  return { type: SET_DROP_OVERLAY, v: _v };
}

export function setList(_v: {}) {
  return { type: SET_LIST, v: _v };
}

export function setTree(_v: {}) {
  return { type: SET_TREE, v: _v };
}

export function setAdd(_v: {}) {
  return { type: SET_ADD, v: _v };
}

/* initial state */
export const initialState/*: {
  screen: {
    width: number;
    height: number;
  },
  sidePanel: {
    visible: boolean;
    active: string;
  },
  dropOverlay: {
    visible: boolean;
    id: string;
    style: {}
  },
  list: FlatItem[],
  tree: SplitItem,
} */ = {
  screen: {
    width: -1, // to be set
    height: -1, // to be set
  },
  sidePanel: {
    visible: true,
    active: DEFAULT_ACTIVE_SIDE_BAR_ICON,
  },
  dropOverlay: {
    visible: false,
    drag_id: '',
    style: {},
  },
  /* initial case
  tree: { list: [] }, */
  /* case1. single multi tab
  tree: {
    list:[
      [{uid:'a1',selected:false},{uid:'a2',selected:true,active:true}]
    ]
  }, */
  /* case2. single split */
  tree: {
    mode: 'horizontal',
    // mode: 'vertical',
    list:[
      [{uid:'a1',selected:false},{uid:'a2',selected:true,active:true}],
      [{uid:'b1',selected:true}]
    ]
  },
  /* case3. split vertical in right pane
  tree: {
    mode: 'horizontal',
    list:[
      [{uid:'b1',selected:true}],
      {
        mode:'vertical',
        list:[
          [{uid:'a1',selected:true}],
          [{uid:'a2',selected:true,active:true}]
        ]
      },
    ]
  }, */
  /* case4. more complex
  tree: {
    mode: 'horizontal',
    list:[
      {
        mode:'vertical',
        list:[
          {
            mode:'horizontal',
            list:[
              [{uid:'a1',selected:true}],
              [{uid:'a2',selected:true,active:true}]
            ]
          },
          [{uid:'a3',selected:true}]
        ]
      },
      [{uid:'b1',selected:true}]
    ]
  }, */

  /* initial case */
  list: [{id:'0',children:[]}],
  /* case1. single multi tab
  list: [{id:'0',children:[{id:'a1',selected:true,active:true},{id:'a2'},{id:'a3'}]}], */
  /* case2. single split
  list: [
    {id:'0',mode:'horizontal',children:[{id:'c1'},{id:'c2'}]},
    {id:'c1',pid:'0',children:[{id:'a1',selected:true}]},
    {id:'c2',pid:'0',children:[{id:'b1'},{id:'b2',selected:true,active:true}]},
  ], */
  /* case3. split vertical in right pane
  list: [
    {id:'0',mode:'horizontal',children:[{id:'c1'},{id:'c2'}]},
    {id:'c1',pid:'0',children:[{id:'d1'},{id:'d2'}]},
    {id:'d1',pid:'c1',children:[{id:'e1',selected:true,active:true}]},
    {id:'d2',pid:'c1',children:[{id:'e2',selected:true}]},
    {id:'c2',pid:'0',mode:'vertical',children:[{id:'a1',selected:true}]},
  ], */

  add: false,
};

/* reducers */
export default (state = initialState, action: { type: string; v: any }) => {
  switch(action.type) {
    case SET_SCREEN:
      return {
        ...state,
        screen: action.v,
      };
    case GET_SCREEN:
      return state.screen;
    case SET_SIDE_PANEL:
      return {
        ...state,
        sidePanel: action.v,
      };
    case GET_SIDE_PANEL:
      return state.sidePanel;
    case SET_DROP_OVERLAY:
      return {
        ...state,
        dropOverlay: action.v,
      };
    case GET_DROP_OVERLAY:
      return state.dropOverlay;
    case SET_LIST:
      return {
        ...state,
        list: action.v,
      };
    case GET_LIST:
      return state.list;
    case SET_TREE:
      return {
        ...state,
        tree: action.v,
      };
    case GET_TREE:
      return state.tree;
    case SET_ADD:
      return {
        ...state,
        add: action.v,
      };
    case GET_ADD:
      return state.add;
    default:
      return state;
  }
};
