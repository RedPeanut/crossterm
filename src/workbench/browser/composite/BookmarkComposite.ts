import { Composite } from "../Composite";

export class BookmarkComposite extends Composite {
  public static ID: string = 'composite.bookmark';

  override create(parent: HTMLElement): void {}
}