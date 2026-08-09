export interface Service { /* marker */ }

export const mainLayoutServiceId = "mainLayoutService";
export const bodyLayoutServiceId = "bodyLayoutService";
export const menubarServiceId = "menubarServiceId";
export const activitybarPartServiceId = "activitybarPartService";
export const sidebarPartServiceId = "sidebarPartService";
export const sessionPartServiceId = "sessionPartService";
export const contextViewServiceId = "contextViewService";
export const storageServiceId = "storageService";
export const blarBlarServiceId = "blarBlarService";

type ServiceId =
  typeof mainLayoutServiceId
  | typeof bodyLayoutServiceId
  | typeof menubarServiceId
  | typeof activitybarPartServiceId
  | typeof sidebarPartServiceId
  | typeof sessionPartServiceId
  | typeof contextViewServiceId
  | typeof storageServiceId
  | typeof blarBlarServiceId
;

const _services = new Map<string, any>();

/**
 * Note. set in ctor
 *
 * @param id
 * @param service
 */
export function setService(id: ServiceId, service: any): any {
  _services.set(id, service);
  return service;
}

/**
 * Note. get after create
 *
 * @param id
 * @returns
 */
export function getService(id: ServiceId): any {
  return _services.get(id);
}