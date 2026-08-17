/* export interface LayoutStateType {
  window_size: { width: number; height: number; },

  sidebar_visible: boolean;
  sidebar_size: number;

  paneview: [
    {
      name: string;
      collapsed: boolean[];
      sizeType: (string | null)[];
      size: (number | null)[];
      preferredHeight: (number | null)[];
    }
  ],
} */

const layoutStateValue = {
  window_size: { width: 800, height: 600 },

  sidebar_visible: true,
  sidebar_size: 240, // SIDEBAR_WIDTH

  paneview: [
    { name: 'bookmark', collapsed: [ false, false ], sizeType: [ 'fill_parent', null ], size: [ null, 200 ], preferredHeight: [ null, 200 ] },
    { name: 'sample', collapsed: [ false ], sizeType: [ 'fill_parent' ], size: [ null ] }
  ],
}

export type LayoutStateType = typeof layoutStateValue;

export interface StorageService {
  getall(): Promise<unknown[]>;
  get<T>(key: string, fallbackValue?: T): Promise<T | undefined>;
  set(key: string, value: any): Promise<boolean>;
  delete(key: string): Promise<boolean>;
}