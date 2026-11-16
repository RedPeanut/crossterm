import assert from 'assert';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { EnvironmentService } from '../../common/service/EnvironmentService';
import { MainFileService } from './MainFileService';
import { MainUserKeybindingsService } from './MainUserKeybindingsService';

describe('#MainUserKeybindingsService', function() {

  let userDataPath: string;
  let keybindingsPath: string;
  let service: MainUserKeybindingsService;

  beforeEach(function() {
    userDataPath = fs.mkdtempSync(path.join(os.tmpdir(), 'crossterm-keybindings-'));
    keybindingsPath = path.join(userDataPath, 'keybindings.json');
    const environmentService: EnvironmentService = { userDataPath };
    service = new MainUserKeybindingsService(environmentService, new MainFileService());
  });

  afterEach(function() {
    service.dispose();
    fs.rmSync(userDataPath, { recursive: true, force: true });
  });

  it('저장한 키바인딩을 다시 읽고, 바뀐 경우에만 이벤트를 보낸다', async function() {
    let changeCount = 0;
    service.onDidChange(() => changeCount++);

    const initial = await service.getKeybindings();
    await service.setKeybindings([
      { key: 'mod+alt+b', command: 'tab.toggleBroadcastInput' },
      { key: 'mod+alt+i', command: '-tab.toggleBroadcastInput', when: 'terminalFocused' },
    ]);
    await service.setKeybindings(await service.getKeybindings()); // 같은 내용 -> 이벤트 없음

    assert.deepStrictEqual({
      initial,
      saved: await service.getKeybindings(),
      file: JSON.parse(fs.readFileSync(keybindingsPath, 'utf8')),
      changeCount,
    }, {
      initial: [],
      saved: [
        { key: 'mod+alt+b', command: 'tab.toggleBroadcastInput' },
        { key: 'mod+alt+i', command: '-tab.toggleBroadcastInput', when: 'terminalFocused' },
      ],
      file: [
        { key: 'mod+alt+b', command: 'tab.toggleBroadcastInput' },
        { key: 'mod+alt+i', command: '-tab.toggleBroadcastInput', when: 'terminalFocused' },
      ],
      changeCount: 1,
    });
  });

  it('깨진 JSON 은 빈 배열, 형식이 틀린 항목은 버린다', async function() {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => { });
    try {
      fs.writeFileSync(keybindingsPath, '[ { "key": "mod+a", ');
      const broken = await service.getKeybindings();

      fs.writeFileSync(keybindingsPath, JSON.stringify([
        { key: 'mod+a', command: 'a', extra: 1 },
        { key: '', command: 'b' },
        { key: 'mod+c' },
        { key: 'mod+d', command: 'd', when: 1 },
        'mod+e',
      ]));
      const invalidEntries = await service.getKeybindings();

      fs.writeFileSync(keybindingsPath, '{ "key": "mod+a", "command": "a" }');
      const notArray = await service.getKeybindings();

      assert.deepStrictEqual({ broken, invalidEntries, notArray }, {
        broken: [],
        invalidEntries: [{ key: 'mod+a', command: 'a' }],
        notArray: [],
      });
    } finally {
      warn.mockRestore();
    }
  });
});
