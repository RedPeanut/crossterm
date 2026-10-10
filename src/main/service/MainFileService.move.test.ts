import fs from 'fs';
import os from 'os';
import path from 'path';
import { MainFileService } from "./MainFileService";

describe('#MainFileService.move', function() {

  let dir: string;
  const fileService = new MainFileService();

  beforeEach(async function() {
    dir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'crossterm-move-'));
  });

  afterEach(async function() {
    await fs.promises.rm(dir, { recursive: true, force: true });
  });

  it('rename file', async function() {
    await fs.promises.writeFile(path.join(dir, 'a.txt'), 'a');
    await fileService.move(path.join(dir, 'a.txt'), path.join(dir, 'b.txt'));
    expect(fs.existsSync(path.join(dir, 'a.txt'))).toBe(false);
    expect(fs.readFileSync(path.join(dir, 'b.txt'), 'utf8')).toBe('a');
  });

  it('rename folder', async function() {
    await fs.promises.mkdir(path.join(dir, 'f1'));
    await fs.promises.writeFile(path.join(dir, 'f1', 'x.txt'), 'x');
    await fileService.move(path.join(dir, 'f1'), path.join(dir, 'f2'));
    expect(fs.readFileSync(path.join(dir, 'f2', 'x.txt'), 'utf8')).toBe('x');
  });

  it('case only rename', async function() {
    await fs.promises.writeFile(path.join(dir, 'a.txt'), 'a');
    await fileService.move(path.join(dir, 'a.txt'), path.join(dir, 'A.txt'));
    expect(await fs.promises.readdir(dir)).toEqual(['A.txt']);
  });

  it('target exists without overwrite', async function() {
    await fs.promises.writeFile(path.join(dir, 'a.txt'), 'a');
    await fs.promises.writeFile(path.join(dir, 'b.txt'), 'b');
    await expect(fileService.move(path.join(dir, 'a.txt'), path.join(dir, 'b.txt'))).rejects.toMatchObject({ code: 'EEXIST' });
    expect(fs.readFileSync(path.join(dir, 'b.txt'), 'utf8')).toBe('b');
  });

  it('target exists with overwrite', async function() {
    await fs.promises.writeFile(path.join(dir, 'a.txt'), 'a');
    await fs.promises.writeFile(path.join(dir, 'b.txt'), 'b');
    await fileService.move(path.join(dir, 'a.txt'), path.join(dir, 'b.txt'), true);
    expect(fs.readFileSync(path.join(dir, 'b.txt'), 'utf8')).toBe('a');
  });

  it('folder into itself', async function() {
    await fs.promises.mkdir(path.join(dir, 'f1'));
    await expect(fileService.move(path.join(dir, 'f1'), path.join(dir, 'f1', 'sub'))).rejects.toThrow('into itself');
  });

  it('similar prefix is not child', async function() {
    await fs.promises.mkdir(path.join(dir, 'f1'));
    await fileService.move(path.join(dir, 'f1'), path.join(dir, 'f10'));
    expect(fs.existsSync(path.join(dir, 'f10'))).toBe(true);
  });
});
