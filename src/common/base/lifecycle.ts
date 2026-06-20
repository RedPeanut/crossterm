export interface IDisposable {
  dispose(): void;
}

export class DisposableStore implements IDisposable {
  private _toDispose = new Set<IDisposable>();
  private _isDisposed = false;

  add<T extends IDisposable>(o: T): T {
    if (this._isDisposed) {
      o.dispose();
      return o;
    }
    this._toDispose.add(o);
    return o;
  }

  dispose(): void {
    if (this._isDisposed) return;
    this._isDisposed = true;

    for (const item of this._toDispose) {
      item.dispose();
    }
    this._toDispose.clear();
  }
}

export class Disposable implements IDisposable {

  private readonly _store = new DisposableStore();

  // return self
  protected _register<T extends IDisposable>(o: T): T {
    return this._store.add(o);
  }

  public dispose(): void {
    this._store.dispose();
  }
}