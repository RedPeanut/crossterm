import Wrapper from './Wrapper';
import log from '../log';

export default class LastStateManager {
  public static async get(key: string): Promise<any> {
    const res = await Wrapper.action('lastStates', 'findOne', {
      _id: key
    }).catch(e => {
      log.error('error get last state..');
    });
    return res ? res.value : null;
  }

  public static async set(key: string, value: any): Promise<any> {
    return await Wrapper.action('lastStates', 'update', {
      _id: key
    }, {
      _id: key,
      value
    }, {
      upsert: true
    });
  }

  public static async clear(key: string): Promise<any> {
    const q = key
      ? { _id: key }
      : {}
    return await Wrapper.action('lastStates', 'remove', q);
  }
}
