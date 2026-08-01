export interface Service { /* marker */ }

export const configurationServiceId = 'configurationService';
export const storageServiceId = 'storageService';
export const fileServiceId = 'fileService';
export const blarBlarServiceId = 'blarBlarService';

type ServiceId =
typeof fileServiceId // FileService
| typeof storageServiceId // storageService
| typeof configurationServiceId // configurationService
| typeof blarBlarServiceId // BlarBlarService
;

const _services = new Map<string, any>();

/**
 * Note. set in ctor
 *
 * @param id
 * @param service
 */
export function setService(id: ServiceId, service: any): void {
  _services.set(id, service);
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