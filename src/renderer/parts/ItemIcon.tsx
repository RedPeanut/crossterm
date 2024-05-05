/**
 * ItemIcon
 * @author: oldj
 * @homepage: https://oldj.net
 */

import React from 'react'
import { BiFile, BiFolder, BiLayer, BiWorld } from 'react-icons/bi'
// import {
//   IconDeviceDesktop,
//   IconFileText,
//   IconFolder,
//   IconStack2,
//   IconTrash,
//   IconWorld,
// } from '@tabler/icons-react'

interface Props {
  type?: string;
  is_collapsed?: boolean;
}

const ItemIcon = (props: Props) => {
  const { type, is_collapsed } = props;

  switch (type) {
    case 'folder':
      // return is_collapsed ? <IconFolder size={16} /> : <IconFolder size={16} />
      // return is_collapsed ? <i className="codicon codicon-folder" /* size={16} */></i>
      //   : <i className="codicon codicon-folder" /* size={16} */></i>
      return <BiFolder />;
    case 'remote':
      // return <IconWorld size={16} />
      // return <i className="codicon codicon-remote-explorer"></i>
      return <BiWorld />;
    case 'group':
      // return <IconStack2 size={16} />
      // return  <i className="codicon codicon-"></i>
      // collection, layer, dock
      return <BiLayer />;
    default:
      // return /* <IconFileText size={16} /> */
      // return <i className="codicon codicon-"></i>;
      return <BiFile />;
  }
}

export default ItemIcon
