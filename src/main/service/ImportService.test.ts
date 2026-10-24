import fs from 'fs';
import os from 'os';
import path from 'path';
import { EnvironmentService } from "../../common/service/EnvironmentService";
import { StorageService } from "../../common/service/StorageService";
import { AppService } from "./AppService";
import { MainFileService } from "./MainFileService";
import { ExportService } from "./ExportService";
import { ImportService } from "./ImportService";

describe('#ImportService', function() {

  let userDataPath: string;
  let sessionsDir: string;
  let backupPath: string;
  let importService: ImportService;
  let reloaded: number;

  beforeEach(async function() {
    userDataPath = fs.mkdtempSync(path.join(os.tmpdir(), 'crossterm-import-'));
    sessionsDir = path.join(userDataPath, 'user', 'sessions');
    backupPath = path.join(userDataPath, 'backup.json');

    // 내보낼 원본: b/remote, b/empty/, a(깨진 JSON), settings.json
    fs.mkdirSync(path.join(sessionsDir, 'b', 'empty'), { recursive: true });
    fs.writeFileSync(path.join(sessionsDir, 'b', 'remote'), JSON.stringify({ type: 'remote', url: { host: 'h' } }));
    fs.writeFileSync(path.join(sessionsDir, 'a'), '{ broken');
    fs.writeFileSync(path.join(userDataPath, 'settings.json'), '{ "foo": 1 }');

    const environmentService: EnvironmentService = { userDataPath };
    const fileService = new MainFileService();
    const appService = new AppService(environmentService, fileService);
    const storageService = { getall: async () => [] } as unknown as StorageService;
    await new ExportService(environmentService, fileService, storageService, appService, '1.0.0').exportTo(backupPath);

    reloaded = 0;
    importService = new ImportService(environmentService, fileService, appService, async () => { reloaded++; });
  });

  afterEach(function() {
    fs.rmSync(userDataPath, { recursive: true, force: true });
  });

  const read = (...p: string[]) => fs.readFileSync(path.join(sessionsDir, ...p), 'utf8');

  it('loads items with counts', async function() {
    expect(await importService.load(backupPath)).toEqual([
      { id: 'sessions', name: 'Sessions', type: 'Session files', count: 2 },
      { id: 'settings', name: 'Settings', type: 'User settings (settings.json)', count: 1 },
    ]);
  });

  it('restores everything into an empty user data', async function() {
    fs.rmSync(path.join(userDataPath, 'user'), { recursive: true });
    fs.rmSync(path.join(userDataPath, 'settings.json'));

    const log = await importService.importFrom(backupPath, ['sessions', 'settings'], 'ignore');

    expect(JSON.parse(read('b', 'remote'))).toEqual({ type: 'remote', url: { host: 'h' } });
    expect(read('a')).toBe('{ broken');
    expect(fs.statSync(path.join(sessionsDir, 'b', 'empty')).isDirectory()).toBe(true);
    expect(JSON.parse(fs.readFileSync(path.join(userDataPath, 'settings.json'), 'utf8'))).toEqual({ foo: 1 });
    expect(reloaded).toBe(1);
    expect(log).toEqual([
      `Copying ${path.join(sessionsDir, 'b', 'remote')}`,
      `Copying ${path.join(sessionsDir, 'a')}`,
      `Copying ${path.join(userDataPath, 'settings.json')}`,
    ]);
  });

  it('ignores existing files', async function() {
    fs.writeFileSync(path.join(sessionsDir, 'a'), 'mine');

    const log = await importService.importFrom(backupPath, ['sessions', 'settings'], 'ignore');

    expect(read('a')).toBe('mine');
    expect(log).toContain('Duplicated. Ignored by user option');
    expect(reloaded).toBe(0);
  });

  it('overwrites existing files', async function() {
    fs.writeFileSync(path.join(sessionsDir, 'a'), 'mine');

    const log = await importService.importFrom(backupPath, ['sessions'], 'overwrite');

    expect(read('a')).toBe('{ broken');
    expect(log).toContain('Duplicated. Overwrite to a');
  });

  it('renames on conflict', async function() {
    fs.writeFileSync(path.join(sessionsDir, 'a (1)'), 'taken');

    const log = await importService.importFrom(backupPath, ['sessions', 'settings'], 'rename');

    expect(read('a')).toBe('{ broken');
    expect(read('a (2)')).toBe('{ broken');
    expect(log).toContain('Duplicated. Renamed to a (2)');
    expect(fs.existsSync(path.join(userDataPath, 'settings (1).json'))).toBe(true);
    expect(reloaded).toBe(0); // settings.json 은 그대로
  });

  it('imports only selected items', async function() {
    fs.rmSync(path.join(userDataPath, 'settings.json'));

    await importService.importFrom(backupPath, ['sessions'], 'ignore');

    expect(fs.existsSync(path.join(userDataPath, 'settings.json'))).toBe(false);
  });

  it('rejects other files and names escaping the sessions folder', async function() {
    const bad = path.join(userDataPath, 'bad.json');

    fs.writeFileSync(bad, '{ "foo": 1 }');
    await expect(importService.load(bad)).rejects.toThrow('Not a crossterm export file');

    fs.writeFileSync(bad, JSON.stringify({ format: 'crossterm-export', version: 1, sessions: [{ name: '../x', type: 'session', raw: '' }] }));
    await expect(importService.importFrom(bad, ['sessions'], 'overwrite')).rejects.toThrow('Invalid session name');
    expect(fs.existsSync(path.join(userDataPath, 'user', 'x'))).toBe(false);
  });
});
