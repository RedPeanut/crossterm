import fs from 'fs';
import os from 'os';
import path from 'path';
import { EnvironmentService } from "../../common/service/EnvironmentService";
import { AppService } from "./AppService";
import { MainFileService } from "./MainFileService";

describe('#AppService', function() {

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
    const appService = new AppService(environmentService, fileService);

    const resultList = await appService.readSessionsDir();
    console.log(resultList);
  });
});
