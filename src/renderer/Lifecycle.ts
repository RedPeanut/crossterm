export interface IDisposable {
  dispose(): void;
}

export abstract class Disposable implements IDisposable {
  dispose(): void {
    throw new Error("Method not implemented.");
  }
}