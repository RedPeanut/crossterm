export class StringUtil {
  public static isEmpty(val): boolean {
    if(val == undefined || val == null || val == 'undefined' || val == '')
      return true;
    if(typeof val === 'string' && val.trim() === '')
      return true;
    if(typeof val === "object" && !Object.keys(val).length)
      return true;
    return false;
  }

  public static fixNull(val: string, def: string = ''): string {
    if(val == undefined || val == null || val == 'undefined' || val == '')
      return def;
    if(typeof val === 'string' && val.trim() === '')
      return def;
    if(typeof val === "object" && !Object.keys(val).length)
      return def;
    return val;
  }
}
