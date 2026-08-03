export interface StorageService {
  // get<T>(key: string, fallbackValue?: T): T | undefined;
  getall(): Promise<unknown[]>;
  set(key: string, value: any): Promise<boolean>;
  delete(key: string): Promise<boolean>;
}