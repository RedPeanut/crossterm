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

  it('default ', async function() {
    const environmentService: EnvironmentService = { userDataPath };
    const fileService = new MainFileService();
    const storageService = new MainStorageService(environmentService, fileService);

    let resultList, resultMap, resultValue;

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
});
