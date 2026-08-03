/* import { StorageService } from "../../../common/service/StorageService";

export class StorageServiceImpl implements StorageService {
  constructor() {}
  // get, getType, store, remove, keys, flush
} */

import path from 'path';
import fs from 'fs';
import sqlite3 from 'sqlite3';
import { FileService } from '../../common/service/FileService';
import { EnvironmentService } from '../../common/service/EnvironmentService';
import { StorageService } from '../../common/service/StorageService';

export class MainStorageService implements StorageService {
  private db: sqlite3.Database;

  constructor(
    private readonly environmentService: EnvironmentService,
    private readonly fileService: FileService
  ) {
    this.init();
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

  getall(): Promise<unknown[]> {
    return new Promise((resolve, reject) => {
      this.db.all('SELECT key, value FROM ItemTable', (err, rows) => {
        if(err) reject(err);
        else resolve(rows); // [{ key, value }, ...]
      });
    });
  }

  set(key: string, value: any): Promise<boolean> {
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
  }

  delete(key: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.db.run('DELETE FROM ItemTable WHERE key = ?', [key], (err) => {
        if(err) reject(err);
        else resolve(true);
      });
    });
  }
}