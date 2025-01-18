import { SplitItem } from "./renderer/Types";

export const terminals: { [key: string]: any } = {};

/* initial case
export const tree: SplitItem = { mode: 'horizontal', list: [] }; */
/* case1. single multi tab
export const tree: SplitItem = {
  mode: 'horizontal',
  list:[
    [{uid:'a1',selected:false},{uid:'a2',selected:true,active:true}]
  ]
}; //*/
///* case2. single split
export const tree: SplitItem = {
  // mode: 'horizontal',
  mode: 'vertical',
  list:[
    [{uid:'a1',selected:false},{uid:'a2',selected:true,active:true}],
    [{uid:'b1',selected:true}]
  ]
}; //*/
/* case3. split vertical in right pane
export const tree: SplitItem = {
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
}; //*/