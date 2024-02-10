/* types */
export const SET_SOME_VAL = 'SET_SOME_VAL';
export const GET_SOME_VAL = 'GET_SOME_VAL';

/* action creator */
export function setSomeVal(_v: string) {
  return { type: SET_SOME_VAL, v: _v };
}

/* initial state */
export const initialState = {
  someVal: '',
};

/* reducers */
export default (state = initialState, action: { type: string, payload: any }) => {
  switch(action.type) {
    case SET_SOME_VAL:
      return {
        ...state,
        someVal: action.payload,
      };
    case GET_SOME_VAL:
      return state.someVal;
    default:
      return state;
  }
};
