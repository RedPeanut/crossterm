import fs from 'fs';
import os from 'os';
import path from 'path';
import { MainFileService } from "./MainFileService";

describe('#AppService', function() {

  let userDataPath: string;

  beforeEach(function() {
    userDataPath = path.join(os.homedir(), 'Library/Application Support', 'crossterm');
  });

  afterEach(function() {
  });

  it('default ', async function() {
    const fileService = new MainFileService();
    fileService.readFile(path.join(userDataPath, 'user/sessions/h'));
  });
});
