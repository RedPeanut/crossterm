import { STATUSBAR_HEIGHT } from '../layout/MainLayout';
import { Part, PartOptions } from '../Part';
import { setService, statusbarPartServiceId } from '../Service';
import { $ } from '../util/dom';

interface StatusbarPartOptions extends PartOptions {}

export class StatusbarPart extends Part {

  size_: HTMLElement;
  position_: HTMLElement;

  constructor(options: StatusbarPartOptions) {
    super(options);
    this.size = STATUSBAR_HEIGHT;
    this.sashEnablement = false;
    setService(statusbarPartServiceId, this);
  }

  /* layoutContainer(offset: number): void {
    this._splitViewContainer.style.top = `${offset}px`;
    this._splitViewContainer.style.height = `${this._size}px`;
  } */

  override create(): void {
    super.create();
    const container = this.container; // super.createContentArea();

    /*
    <div class='size'></div>
    <div class='position'></div>
    */

    const leftItems = $('.left-items');
    const msgBox = $('.msg-box');
    // leftItems.appendChild(msgBox);

    const rightItems = $('.right-items');

    const position = this.position_ = $('div.position');
    const size = this.size_ = $('div.size');

    position.textContent = 'Pos: NN,MM';
    size.textContent = 'Sz: NNxMM';

    rightItems.appendChild(position);
    rightItems.appendChild(size);

    container.appendChild(leftItems);
    container.appendChild(rightItems);
    // return container;
  }

}