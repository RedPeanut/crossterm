export interface Service { /* marker */ }

export const workbenchLayoutServiceId = "workbenchLayoutService";
export const bodyLayoutServiceId = "bodyLayoutService";
export const blarBlarServiceId = "blarBlarService";

type ServiceId = typeof workbenchLayoutServiceId // WorkbenchLayoutService
  | typeof bodyLayoutServiceId // BodyLayoutService
  | typeof blarBlarServiceId // BlarBlarService
;

const _services = new Map<string, any>();

export function setService(id: ServiceId, service: any): void {
  _services.set(id, service);
}

export function getService(id: ServiceId): any {
  return _services.get(id);
}