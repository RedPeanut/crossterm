import fs from 'fs';
import os from 'os';
import path from 'path';
import { MainFileService } from "./MainFileService";

describe('#MainFileService', function() {

  let userDataPath: string;

  beforeEach(function() {
    userDataPath = path.join(os.homedir(), 'Library/Application Support', 'crossterm');
  });

  afterEach(function() {
  });

  it('readFile ', async function() {
    const fileService = new MainFileService();
    const reads = await fileService.readFile(path.join(userDataPath, 'user/sessions/remote1'));
    console.log('reads =', reads.toString('utf8'));
    console.log('parsed =', JSON.parse(reads.toString('utf8')));
  });
});
