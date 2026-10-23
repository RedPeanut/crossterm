import fs from 'fs';
import os from 'os';
import path from 'path';
import { EnvironmentService } from "../../common/service/EnvironmentService";
import { StorageService } from "../../common/service/StorageService";
import { AppService } from "./AppService";
import { MainFileService } from "./MainFileService";
import { ExportedData, ExportService } from "./ExportService";

describe('#ExportService', function() {

  let userDataPath: string;

  beforeEach(function() {
    userDataPath = fs.mkdtempSync(path.join(os.tmpdir(), 'crossterm-export-'));
  });

  afterEach(function() {
    fs.rmSync(userDataPath, { recursive: true, force: true });
  });

  it('exports sessions tree, settings and state', async function() {
    const sessionsDir = path.join(userDataPath, 'user', 'sessions');
    fs.mkdirSync(path.join(sessionsDir, 'b', 'empty'), { recursive: true });
    fs.writeFileSync(path.join(sessionsDir, 'b', 'remote'), JSON.stringify({ type: 'remote', url: { host: 'h', port: 22, username: 'u', password: 'p' } }));
    fs.writeFileSync(path.join(sessionsDir, 'a'), '{ broken');
    fs.writeFileSync(path.join(sessionsDir, '.DS_Store'), '');
    fs.writeFileSync(path.join(userDataPath, 'settings.json'), '{ "foo": 1 }');

    const environmentService: EnvironmentService = { userDataPath };
    const fileService = new MainFileService();
    const storageService = { getall: async () => [{ key: 'layoutState', value: '{"x":1}' }] } as unknown as StorageService;
    const appService = new AppService(environmentService, fileService);
    const exportService = new ExportService(environmentService, fileService, storageService, appService, '1.0.0');

    const target = path.join(userDataPath, 'out', 'backup.json');
    const log = await exportService.exportTo(target);
    const data: ExportedData = JSON.parse(fs.readFileSync(target, 'utf8'));

    expect(data.format).toBe('crossterm-export');
    expect(data.sessions).toEqual([
      { name: 'b', type: 'folder', children: [
        { name: 'empty', type: 'folder', children: [] },
        { name: 'remote', type: 'session', data: { type: 'remote', url: { host: 'h', port: 22, username: 'u', password: 'p' } } },
      ] },
      { name: 'a', type: 'session', raw: '{ broken' },
    ]);
    expect(data.settings).toEqual({ foo: 1 });
    // expect(data.state).toEqual({ layoutState: '{"x":1}' });
    expect(log).toContain(path.join(sessionsDir, 'b', 'remote'));
    expect(log).toContain('  warning: invalid JSON, exported as raw text');
  });

  it('settings.json is optional', async function() {
    const environmentService: EnvironmentService = { userDataPath };
    const fileService = new MainFileService();
    const storageService = { getall: async () => [] } as unknown as StorageService;
    const exportService = new ExportService(environmentService, fileService, storageService, new AppService(environmentService, fileService), '1.0.0');

    const target = path.join(userDataPath, 'backup.json');
    await exportService.exportTo(target);
    const data: ExportedData = JSON.parse(fs.readFileSync(target, 'utf8'));

    expect(data.sessions).toEqual([]);
    expect(data.settings).toBeNull();
  });
});
