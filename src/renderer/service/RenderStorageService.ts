import { StorageService } from "../../common/service/StorageService";

export class RenderStorageService implements StorageService {
  // UI 렌더링 딜레이를 막기 위해 Renderer 메모리에 캐싱
  private cache: Map<string, string> = new Map();
  private isReady: Promise<void>;

  constructor() {
    // 앱(Renderer) 초기화 시 Main DB에서 전량 로드
    this.isReady = this.initCache();
  }

  private async initCache(): Promise<void> {
    const items = await window.ipc.invoke('storage getall');
    items.forEach(({ key, value }) => {
      this.cache.set(key, value);
    });
  }

  // 초기화 완료 대기 (앱 시작 시 1회)
  public whenReady(): Promise<void> {
    return this.isReady;
  }

  // Synchronous 처럼 사용하는 Get (캐시 사용)
  public get<T>(key: string, fallbackValue?: T): T | undefined {
    const rawValue = this.cache.get(key);
    if(rawValue === undefined) return fallbackValue;

    try {
      return JSON.parse(rawValue) as T;
    } catch {
      return rawValue as unknown as T;
    }
  }

  // Asynchronous Set (캐시 반영 + IPC 전송)
  public async set(key: string, value: any): Promise<void> {
    const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);

    // 1. 메모리 캐시 즉시 업데이트 (UI 반영용)
    this.cache.set(key, stringValue);

    // 2. Main Process IPC 통신을 통해 SQLite3에 비동기 저장
    await window.ipc.invoke('storage set', key, stringValue);
  }

  public async delete(key: string): Promise<void> {
    this.cache.delete(key);
    await window.ipc.invoke('storage delete', key);
  }
}