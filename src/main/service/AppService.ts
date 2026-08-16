import path from 'path';
import fs from 'fs';
import { FileService } from '../../common/service/FileService';
import { DirentExt, ListItemElem } from '../../common/Types';
import { EnvironmentService } from '../../common/service/EnvironmentService';
import { v4 as uuidv4 } from 'uuid';

export class AppService {

  ignoreFileFolder: string = '.git,.DS_Store,node_modules,package-lock.json,dll,dist,build';

  constructor(
    private readonly environmentService: EnvironmentService,
    private readonly fileService: FileService
  ) {}

  async readdir(_path: string, depth: number, parent: ListItemElem) {

    const resultList: ListItemElem[] = [];
    const items: DirentExt[] = await this.fileService.readdirWithStat(_path);;

    // folder first
    let folders: ListItemElem[] = [], files: ListItemElem[] = [];
    const filters: string[] = this.ignoreFileFolder.split(',');

    for(let i = 0; i < items.length; i++) {
      const item: DirentExt = items[i];

      if(filters.includes(item.name))
        continue;

      if(item.isDirectory) {
        folders.push({
          ...item,
          children: [], isCollapsed: false,
          type: 'folder',
          id: uuidv4(),
          title: item.name
        });
      } else {
        const reads = await this.fileService.readFile(path.join(item.path, item.name));
        // console.log('reads =', reads.toString('utf8'));
        const parsed = JSON.parse(reads.toString('utf8'));

        files.push({
          ...item,
          ...parsed,
          id: uuidv4(),
          title: item.name
        });
      }
    }

    folders.sort((a: ListItemElem, b: ListItemElem) => {
      return a.name < b.name ? -1 : (a.name > b.name ? 1 : 0);
    });

    files.sort((a: ListItemElem, b: ListItemElem) => {
      return a.name < b.name ? -1 : (a.name > b.name ? 1 : 0);
    });

    // find have children
    const length_array = [];
    length_array.length = folders.length;

    for(let i = 0; i < folders.length; i++) {
    }

    for(let i = 0; i < folders.length; i++) {
      const elem: ListItemElem = folders[i];
      const __path = _path + path.sep + elem.name;
      const children = await this.readdir(__path, depth+1, elem);
      elem.children.push(...children);
    }

    for(let i = 0; i < files.length; i++) {
    }

    resultList.push(...folders);
    resultList.push(...files);
    return resultList;
  }

  async readSessionsDir(): Promise<ListItemElem[]> {

    /*
    - mkdir -p user/sessions
    - readdir recursively

    - default.json
    {
      title: string,
      id: '',
      type: string, // 'local'|'remote'
      url: {
        host: string, // ex) '1.2.3.4'
        port: number,
        username: string,
        password: string, // encrypted
      },
      size: { row: number, col: number } // useless
    }

    - in session file
    {
      id: '',
      title: 'xyz',
      type: 'remote',
      url: {
        host: '192.168.0.25',
        port: 22,
        username: 'kimjk',
        password: '1234',
      },
      size: { row: 24, col: 80 }
    }
    */

    const userDataPath = this.environmentService.userDataPath;
    const sessionsDir = userDataPath + path.sep + 'user' + path.sep + 'sessions';

    let exists = await this.fileService.exists(sessionsDir);
    if(!exists) {
      await fs.promises.mkdir(sessionsDir, { recursive: true });
    }

    /* const defaultJsonFilePath = userDataPath + path.sep + 'user' + path.sep + 'default.json'
    exists = await this.fileService.exists(defaultJsonFilePath);
    if(!exists) {
      await fs.promises.copyFile(utils.getAssetPath('default.json'), defaultJsonFilePath);
    } */
    return await this.readdir(sessionsDir, 0, null);
  }

}