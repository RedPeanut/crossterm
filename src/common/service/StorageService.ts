export interface StorageService {
  get<T>(key: string, fallbackValue?: T): T | undefined;
  set(key: string, value: any): Promise<void>;
  delete(key: string): Promise<void>;
}