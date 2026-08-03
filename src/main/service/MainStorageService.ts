/* import { StorageService } from "../../../common/service/StorageService";

export class StorageServiceImpl implements StorageService {
  constructor() {}
  // get, getType, store, remove, keys, flush
} */

import { app, ipcMain } from 'electron';
import path from 'path';
import fs, { Dirent } from 'fs';
import sqlite3 from 'sqlite3';
import { fileServiceId, getService } from '../Service';
import { FileService } from '../../common/service/FileService';
import { EnvironmentService } from './EnvironmentService';

export class MainStorageService {
  private db: sqlite3.Database;

  constructor(
    private readonly environmentService: EnvironmentService,
    private readonly fileService: FileService
  ) {
    this.init();
    this.registerIpcHandlers();
  }

  private async init(): Promise<void> {
    const userDir = this.environmentService.userDataPath + path.sep + 'user';

    let exists = await this.fileService.exists(userDir);
    if(!exists) {
      await fs.promises.mkdir(userDir, { recursive: true });
    }

    const dbPath = path.join(userDir, 'state.sqldb');
    this.db = new sqlite3.Database(dbPath);

    this.db.run(`
      CREATE TABLE IF NOT EXISTS ItemTable (
        key TEXT PRIMARY KEY,
        value TEXT
      )
    `);
  }

  private registerIpcHandlers(): void {
    // 1. 초기 로드 (Renderer 시작 시 전체 캐시 동기화용)
    ipcMain.handle('storage getall', () => {
      return new Promise((resolve, reject) => {
        this.db.all('SELECT key, value FROM ItemTable', (err, rows) => {
          if(err) reject(err);
          else resolve(rows); // [{ key, value }, ...]
        });
      });
    });

    // 2. 값 저장 (UPSERT)
    ipcMain.handle('storage set', (_, key: string, value: string) => {
      return new Promise((resolve, reject) => {
        const query = `
          INSERT INTO ItemTable (key, value) VALUES (?, ?)
          ON CONFLICT(key) DO UPDATE SET value = excluded.value
        `;
        this.db.run(query, [key, value], (err) => {
          if(err) reject(err);
          else resolve(true);
        });
      });
    });

    // 3. 값 삭제
    ipcMain.handle('storage delete', (_, key: string) => {
      return new Promise((resolve, reject) => {
        this.db.run('DELETE FROM ItemTable WHERE key = ?', [key], (err) => {
          if(err) reject(err);
          else resolve(true);
        });
      });
    });
  }
}