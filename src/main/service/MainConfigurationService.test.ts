import assert from 'assert';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { EnvironmentService } from "../../common/service/EnvironmentService";
import { MainFileService } from "./MainFileService";
import { MainConfigurationService, flatten } from './MainConfigurationService';

describe('#MainConfigurationService', function() {

  let userDataPath: string;

  beforeEach(function() {
    // fs.mkdtempSync(path.join(os.tmpdir(), 'crossterm'));
    userDataPath = path.join(os.homedir(), 'Library/Application Support', 'crossterm');
  });

  afterEach(function() {
    // fs.rmSync(userDataPath, { recursive: true, force: true });
  });

  it.skip('기본동작 테스트', async function() {
    const environmentService: EnvironmentService = { userDataPath };
    const fileService = new MainFileService();
    const configurationService = new MainConfigurationService(environmentService, fileService);

    let resultList, resultMap, resultVal;

    const settingsPath = path.join(environmentService.userDataPath, 'settings.json');
    await fileService.writeFileAtomic(settingsPath, '{ "foo": "bar" }');

    // configurationService.init(); // useless
    resultVal = await configurationService.getValue('foo');
    console.log(typeof resultVal);
    console.log(resultVal);
  });

  it.skip('하위뎁스값 설정 확인', async function() {
    const environmentService: EnvironmentService = { userDataPath };
    const fileService = new MainFileService();
    const configurationService = new MainConfigurationService(environmentService, fileService);

    let resultList, resultMap, resultVal;
    await configurationService.updateValue('foo.bar', true);
    await configurationService.updateValue('foo.bar.baz', 1); // .qux.corge.grault.garply.waldo.fred.plugh.xyzzy.thud
    console.log(await configurationService.keys());
  });

  it('check flatten op', async function() {
    // console.log(flatten({'a.b.c':true}));
    let flattened;

    flattened = flatten({'a':{'b':{'c':true}}});
    // console.log(flattened); // {'a.b.c': true}

    flattened = flatten({a:{b:[1,2,3]}});
    // console.log(flattened); // {'a.b': [1, 2, 3]}

    flattened = flatten({a:{b:[{c:{d:1}},{e:2}]}});
    // console.log(flattened); //{ 'a.b': [ { c: [Object] }, { e: 2 } ] }
  });

  it.skip('check diffKeys op', async function() {});
  it.skip('check deepEquals op', async function() {});

  it.skip('check reload op', async function() {});
  it.skip('check deepMerge op', async function() {});

});
