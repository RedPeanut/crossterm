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

/* initial state */
export const initialState/*: {
  screen: {
    width: number;
    height: number;
  }
  sidebar: {
    width: number;
    visible: boolean;
    active: string;
  };
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
    id: '',
    style: {},
  },
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
    default:
      return state;
  }
};
