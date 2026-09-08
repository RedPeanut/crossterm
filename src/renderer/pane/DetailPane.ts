import { ListItemElem } from "../../common/Types";
import { Pane, PaneOptions } from "../Pane";
import { getService, sidebarPartServiceId } from "../Service";
import { SidebarPartService } from "../part/SidebarPart";
import { $ } from "../util/dom";
import * as dom from "../util/dom";
import { _addEventListener } from "../util/dom";

interface DetailRow {
  label: string;
  value: (item: ListItemElem) => string;
}

/** 상세 표에 보여줄 항목. 선택이 없으면 값은 모두 비운다. */
const DETAIL_ROWS: DetailRow[] = [
  { label: '이름', value: (item) => item.title || item.name || '' },
  {
    label: '종류',
    value: (item) => item.type === 'remote' ? '원격' :
      item.type === 'local' ? '로컬' :
      item.type === 'folder' ? '폴더' : ''
  },
  { label: '호스트', value: (item) => item.url?.host || '' },
  { label: '사용자이름', value: (item) => item.url?.username || '' },
  { label: '포트', value: (item) => item.url?.port ? String(item.url.port) : '' },
  { label: '설명', value: (item) => item.description || '' },
];

export class DetailPane extends Pane {

  // splitView: SplitView<DetailLeft | DetailBody>;

  override layout(offset: number, size: number) {
    console.log(`layout is called .., offset = ${offset}, size = ${size}`);

    // position sash
    const firstHeader = this.wrap.querySelector('th');
    const width = dom.getTotalWidth(firstHeader);
    const sash = this.wrap.querySelector('.table-sash') as HTMLElement;
    sash.style.left = `${width}px`;
  }

  constructor(parent: HTMLElement, options: PaneOptions) {
    super(parent, options);
    this.element.classList.add('detail');
    this.minimumSize = Pane.HEADER_SIZE;
  }

  renderHeader(container: HTMLElement): void {
    // const klass: string = this.expanded ? '' : 'collapsed';
    // if (!this.expanded)
    //   this.header.classList.add('collapsed');
    const arrow = $('.arrow');
    const right = $('a.codicon.codicon-chevron-right');
    arrow.appendChild(right);
    this._register(_addEventListener(arrow, 'click', (e: MouseEvent) => {
      this.expanded = !this.expanded;
      (getService(sidebarPartServiceId) as SidebarPartService).layout(null, null);
    }));
    this.header.appendChild(arrow);
    const title = $('h3.title');
    title.innerHTML = 'DETAIL';
    this.header.appendChild(title);
  }

  wrap: HTMLElement;
  /** DETAIL_ROWS 와 같은 순서의 값 셀 */
  valueCells: HTMLElement[] | undefined;
  item: ListItemElem | undefined;

  /**
   * 상세에 표시할 항목을 바꾼다. 선택이 없으면 undefined 를 넘겨 값을 비운다.
   */
  setItem(item: ListItemElem | undefined): void {
    this.item = item;

    // 아직 renderBody 전이면 렌더 시점에 반영된다
    if (!this.valueCells) return;

    DETAIL_ROWS.map((row, i) => {
      this.valueCells[i].textContent = item ? row.value(item) : '';
    });
  }

  renderBody(container: HTMLElement): void {
    // draw description in body in here
    /* const p = $('p');
    p.innerHTML = 'blarblarblar<br/>blarblarblar<br/>blarblarblar';
    this.body.appendChild(p); */

    /* const splitView = this.splitView = new SplitView(this.body, { orientation: Orientation.HORIZONTAL });
    const detailLeft = new DetailLeft();
    const detailBody = new DetailBody();
    splitView.addView(detailLeft);
    splitView.addView(detailBody); */

    /*
    <table style="table-layout: fixed; width: 100%; border-collapse: collapse;">
      <tbody>
        <tr><th style="position:relative;">컬럼A<div class="table-sash"></div></th><td>내용A</td></tr>
        <tr><th style="position:relative;">컬럼B<div class="table-sash"></div></th><td>내용B</td></tr>
        <tr><th style="position:relative;">컬럼C<div class="table-sash"></div></th><td>내용C</td></tr>
      </tbody>
    </table>
    */

    const wrap = this.wrap = $('.wrap');
    wrap.style.position = 'relative';

    const table = $('table') as HTMLTableElement;
    const tbody = $('tbody');
    const valueCells: HTMLElement[] = this.valueCells = [];

    DETAIL_ROWS.map((row, i) => {
      const tr = $('tr'), th = $('th'), td = $('td');
      tr.dataset.parity = i%2 == 0 ? 'even' : 'odd';
      th.innerHTML = row.label;
      tr.appendChild(th); tr.appendChild(td); tbody.appendChild(tr);
      valueCells.push(td);
    });

    table.appendChild(tbody);
    wrap.appendChild(table);
    this.enableTableResizable(wrap);
    this.body.appendChild(wrap);

    // // 렌더 전에 setItem 이 먼저 불렸을 수 있다?
    // this.setItem(this.item);
  }

  enableTableResizable(wrap: HTMLElement) {

    // add sash
    const sash = $('.table-sash');
    wrap.appendChild(sash);

    // add event handler
    this._register(_addEventListener(sash, 'pointerdown', (e: PointerEvent) => {
      e.preventDefault();
      sash.classList.add('active');

      const ths = wrap.querySelectorAll('th');
      // const width = dom.getTotalWidth(firstHeader);

      const startX = e.clientX;
      const startWidth = ths[0].getBoundingClientRect().width;

      // VS Code Sash의 _onPointerMove 구조와 동일
      const onPointerMove = (moveEvent: PointerEvent) => {
        const deltaX = moveEvent.clientX - startX;

        // 마이너스 너비가 되지 않도록 minWidth 제한 (예: 50px)
        const newWidth = Math.max(50, startWidth + deltaX);
        ths.forEach((th) => {
          th.style.width = `${newWidth}px`;
        });

        sash.style.left = `${newWidth - 4/2}px`;
      };

      // VS Code Sash의 _onPointerUp 구조와 동일
      const onPointerUp = () => {
        sash.classList.remove('active');

        // 이벤트 핸들러 제거 (메모리 누수 방지)
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', onPointerUp);
      };

      // 전역(window)에 이벤트를 걸어야 테이블 밖으로 마우스가 나가도 부드럽게 트래킹됨
      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerUp);
    }));

    /* const headers = tableEl.querySelectorAll('th');

    headers.forEach((th) => {
      // const sash = th.querySelector('.table-sash');
      // if (!sash) return;

      const sash = $('div.table-sash')
      th.append(sash);

      sash.addEventListener('pointerdown', (e: PointerEvent) => {
        e.preventDefault();
        sash.classList.add('active');

        const startX = e.clientX;
        const startWidth = th.getBoundingClientRect().width;

        // VS Code Sash의 _onPointerMove 구조와 동일
        const onPointerMove = (moveEvent) => {
          const deltaX = moveEvent.clientX - startX;

          // 마이너스 너비가 되지 않도록 minWidth 제한 (예: 50px)
          const newWidth = Math.max(50, startWidth + deltaX);
          th.style.width = `${newWidth}px`;
        };

        // VS Code Sash의 _onPointerUp 구조와 동일
        const onPointerUp = () => {
          sash.classList.remove('active');

          // 이벤트 핸들러 제거 (메모리 누수 방지)
          window.removeEventListener('pointermove', onPointerMove);
          window.removeEventListener('pointerup', onPointerUp);
        };

        // 전역(window)에 이벤트를 걸어야 테이블 밖으로 마우스가 나가도 부드럽게 트래킹됨
        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('pointerup', onPointerUp);
      });
    }); */
  }

}