export interface Service { /* marker */ }

export const fileServiceId = 'fileService';
export const storageServiceId = 'storageService';
export const configurationServiceId = 'configurationService';
export const appServiceId = 'appService';
export const environmentServiceId = 'environmentService';
export const dialogServiceId = 'dialogService';
export const blarBlarServiceId = 'blarBlarService';

type ServiceId =
  typeof fileServiceId
  | typeof storageServiceId
  | typeof configurationServiceId
  | typeof appServiceId
  | typeof environmentServiceId
  | typeof dialogServiceId
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