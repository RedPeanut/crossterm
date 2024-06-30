import * as path from 'path';
import { app } from 'electron';
import PotDb from 'potdb';
import Runtime from '../Runtime';

declare global {
  var data_dir: string | undefined;
  var appdb: PotDb;
  var cfgdb: PotDb;
  var localdb: PotDb;
}

let localdb: PotDb;
let cfgdb: PotDb;
let appdb: PotDb;

if(!global.localdb) {
  let db_dir: string = path.join(Runtime.userPath, '_local');
  localdb = new PotDb(db_dir);
  console.log(`local db: ${localdb.dir}`);
  global.localdb = localdb;
} else {
  localdb = global.localdb;
}

if(!global.cfgdb) {
  let db_dir: string = path.join(Runtime.dataDir, 'config');
  cfgdb = new PotDb(db_dir);
  console.log(`config db: ${cfgdb.dir}`);
  global.cfgdb = cfgdb;
} else {
  cfgdb = global.cfgdb;
}

async function getAppDb(): Promise<PotDb> {
  if(!appdb) {
    global.data_dir = await localdb.dict.local.get('data_dir');
    let db_dir: string = path.join(Runtime.dataDir, 'data');
    appdb = new PotDb(db_dir);
    console.log(`data db: ${appdb.dir}`);
    global.appdb = appdb;
  }
  return appdb;
}

export { localdb, cfgdb, appdb, getAppDb }
