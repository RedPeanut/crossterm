export interface StorageService {
  getall(): Promise<unknown[]>;
  get<T>(key: string, fallbackValue?: T): Promise<T | undefined>;
  set(key: string, value: any): Promise<boolean>;
  delete(key: string): Promise<boolean>;
}