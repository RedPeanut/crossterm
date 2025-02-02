import { isSplitItem, SplitItem } from "./renderer/Types";

export const terminals: { [key: string]: any } = {};

export const wrapper: { [key: string]: SplitItem } = {
  // /* initial case
  'tree': {} //*/
  /* case1. single multi tab
  'tree': {
    mode: 'horizontal',
    list:[
      [{uid:'a1',selected:false},{uid:'a2',selected:true,active:true}]
    ]
  } //*/
  /* case2. single split
  'tree': {
    mode: 'horizontal',
    // mode: 'vertical',
    list:[
      [{uid:'a1',selected:false},{uid:'a2',selected:true,active:true}],
      [{uid:'b1',selected:true}]
    ]
  } //*/
  /* case2-1. single split
  'tree': {
    mode: 'horizontal',
    list:[
      [{uid:'a1',selected:true},{uid:'a2',selected:true},{uid:'a3',selected:true,active:true}],
      [{uid:'b1',selected:true}]
    ]
  } //*/
  /* case3. split vertical in right pane
  'tree': {
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
  } //*/
  /* case3-1. split vertical in right pane
  'tree': {
    mode: 'horizontal',
    list:[
      [{uid:'b1',selected:true}],
      {
        mode:'vertical',
        list:[
          [{uid:'a11'},{uid:'a12',selected:true}],
          [{uid:'a2',selected:true,active:true}]
        ]
      },
    ]
  } //*/
};


