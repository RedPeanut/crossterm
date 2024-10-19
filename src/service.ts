export interface Service { /* marker */ }

export const workbenchLayoutServiceId = "workbenchLayoutService";
export const bodyLayoutServiceId = "bodyLayoutService";
export const activitybarPartServiceId = "activitybarPartService";
export const sidebarPartServiceId = "sidebarPartService";
export const blarBlarServiceId = "blarBlarService";

type ServiceId = typeof workbenchLayoutServiceId // WorkbenchLayoutService
  | typeof bodyLayoutServiceId // BodyLayoutService
  | typeof activitybarPartServiceId // ActivitybarPartService
  | typeof sidebarPartServiceId // SidebarPartService
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