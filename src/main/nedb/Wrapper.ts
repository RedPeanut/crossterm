import path from 'path';
import Runtime from '../Runtime';

const Datastore = require('@yetzt/nedb');
const reso = (name: string) => {
  return path.resolve(Runtime.appPath, 'crossterm', `crossterm.${name}.nedb`)
};

/* 'public', 'static' modifier cannot appear on a module or namespace element.ts(1044)
public static */
export default class NedbWrapper {

  public static db: {[index: string]: any} = {};

  public static tables = [
    'bookmarks',
    'lastStates',
  ];

  static {
    this.tables.forEach(table => {
      const conf = {
        filename: reso(table),
        autoload: true
      };
      this.db[table] = new Datastore(conf);
    });
  }

  public static action(dbName: string, op: string, ...args: any[]): Promise<any> {
    return new Promise((resolve, reject) => {
      NedbWrapper.db[dbName][op](...args, (err: any, result: string) => {
        if(err) {
          return reject(err);
        }
        resolve(result);
      });
    })
  }

  /* public static class LastState {
    public static any get(key) {
      const res = await NedbWrapper.action('lastState', 'findOne', {
        _id: key
      }).catch(e => {
        log.error('error get last state..');
      });
      return res ? res.value : null;
    }

    public static void set(key, value) {
      return NedbWrapper.action('lastStates', 'update', {
        _id: key
      }, {
        _id: key,
        value
      }, {
        upsert: true
      });
    }

    public static void clear(key: string) {
      const q = key
        ? { _id: key }
        : {}
      return NedbWrapper.action('lastStates', 'remove', q);
    }
  } */

}
