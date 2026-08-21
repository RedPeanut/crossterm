// renderer to main
export type MainEvents =
  // terminal
  'terminal new'
  | 'terminal write'
  | 'terminal resize'
  | 'terminal close'

  // menu
  | 'menu get'

  // window
  | 'window get'
  | 'window fn'

  // process
  | 'process get'

  // config
  | 'config all'
  | 'config get'
  | 'config set'
  | 'config update'

  // configuration
  | 'configuration get value'
  | 'configuration update value'
  | 'configuration keys'

  // storage (sqlite)
  | 'storage getall'
  | 'storage set'
  | 'storage delete'

  // action
  | 'get package json'
  | 'read sessions dir'

  //
  | 'open context menu'
  | 'command'
  | 'contextmenu'

  // file or folder op
  | 'file read'
  | 'file write atomic'
  // | 'file exists'
  // | 'folder readdir with stat'

  // app
  | 'app quit ready'

  // dialog
  | 'dialog show messagebox'
;

// main to renderer
export type RenderEvents =
  'terminal add'
  | 'terminal data'
  | 'terminal connected'
  | 'terminal error'
  | 'terminal closed'
  // | 'terminal exit'

  // window
  | 'window state changed'

  // app
  | 'app quit request'

  // configuration
  | 'configuration changed'
;

export type Channels = MainEvents | RenderEvents;