import fs from 'fs';
import os from 'os';
import path from 'path';
import { EnvironmentService } from "../../common/service/EnvironmentService";
import { AppService } from "./AppService";
import { MainFileService } from "./MainFileService";
import { MainStorageService } from './MainStorageService';

describe('#MainStorageService', function() {

  let userDataPath: string;

  beforeEach(function() {
    // fs.mkdtempSync(path.join(os.tmpdir(), 'crossterm'));
    userDataPath = path.join(os.homedir(), 'Library/Application Support', 'crossterm');
  });

  afterEach(function() {
    // fs.rmSync(userDataPath, { recursive: true, force: true });
  });

  it('기본동작 테스트#1 (test set n getall by sessions.treeViewState)', async function() {
    const environmentService: EnvironmentService = { userDataPath };
    const fileService = new MainFileService();
    const storageService = new MainStorageService(environmentService, fileService);

    let resultList, resultMap, resultVal;

    // 구분자는 ::, 상대경로로 기술
    await storageService.set('sessions.treeViewState', JSON.stringify({
      focus:[],
      selection:[],
      expanded:[
        // r: root, c: child, p: parent
        'r1::c11',
        'r3::c32::cc321'
      ]})
    );
    resultList = await storageService.getall();
    console.log(resultList);
  });

  it('기본동작 테스트#2 (test set n get by layoutState)', async function() {
    const environmentService: EnvironmentService = { userDataPath };
    const fileService = new MainFileService();
    const storageService = new MainStorageService(environmentService, fileService);

    let resultList, resultMap, resultVal;

    resultVal = await storageService.set('layoutState', JSON.stringify(
      {
        window_size: { width: 800, height: 600 },
        // grid_size: { width: 800, height: 600 }, // not use

        // activitybar_visible: true, // not use
        // activitybar_size: ACTIVITYBAR_WIDTH, // not use
        // activitybar_position: 0, // not use
        // activitybar_alignment: 'center', // not use

        sidebar_visible: true,
        sidebar_size: 240, // SIDEBAR_WIDTH
        // sidebar_position: 0, // left | right | bottom // not use
        // sidebar_alignment: 'center', // not use

        // // panel_visible: true, // not use
        // panel_size: 0,
        // panel_position: 0,
        // panel_alignment: 'center', // left | center | right

        paneview: [
          { name: 'bookmark', collapsed: [ false, false ], sizeType: [ 'fill_parent', null ], size: [ null, 200 ], preferredHeight: [ null, 200 ] },
          { name: 'sample', collapsed: [ false ], sizeType: [ 'fill_parent' ], size: [ null ] }
        ],
      }
    ));

    resultVal = await storageService.get<string>('layoutState');
    console.log('storage layoutState is', JSON.parse(resultVal));
  });
});
