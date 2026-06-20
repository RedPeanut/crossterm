export interface IDisposable {
  dispose(): void;
}

export class DisposableStore implements IDisposable {
  private _toDispose = new Set<IDisposable>();
  private _isDisposed = false;

  public add<T extends IDisposable>(o: T): T {
    if (this._isDisposed) {
      o.dispose();
      return o;
    }
    this._toDispose.add(o);
    return o;
  }

  public dispose(): void {
    if (this._isDisposed) return;
    this._isDisposed = true;

    for (const item of this._toDispose) {
      item.dispose();
    }
    this._toDispose.clear();
  }
}