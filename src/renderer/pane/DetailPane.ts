import { Pane, PaneOptions } from "../Pane";
import { getService, sidebarPartServiceId } from "../Service";
import { SidebarPartService } from "../part/SidebarPart";
import { $ } from "../util/dom";
import * as dom from "../util/dom";

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
    // if(!this.expanded)
    //   this.header.classList.add('collapsed');
    const arrow = $('.arrow');
    const right = $('a.codicon.codicon-chevron-right');
    arrow.appendChild(right);
    arrow.addEventListener('click', (e: MouseEvent) => {
      this.expanded = !this.expanded;
      (getService(sidebarPartServiceId) as SidebarPartService).layout(null, null);
    });
    this.header.appendChild(arrow);
    const title = $('h3.title');
    title.innerHTML = 'DETAIL';
    this.header.appendChild(title);
  }

  wrap: HTMLElement;

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

    // 호스트, 사용자이름, 프로토콜, 포트, 설명
    const wrap = this.wrap = $('.wrap');
    wrap.style.position = 'relative';

    const table = $('table') as HTMLTableElement;
    const tbody = $('tbody');
    let tr, th, td, i = 0;
    tr = $('tr'); th = $('th'); td = $('td');
    tr.dataset.parity = i%2 == 0 ? 'even' : 'odd'; i++;
    th.innerHTML = '호스트';
    td.innerHTML = '123.123.123.123';
    tr.appendChild(th); tr.appendChild(td); tbody.appendChild(tr);

    tr = $('tr'); th = $('th'); td = $('td');
    tr.dataset.parity = i%2 == 0 ? 'even' : 'odd'; i++;
    th.innerHTML = '프로토콜';
    td.innerHTML = 'SSH';
    tr.appendChild(th); tr.appendChild(td); tbody.appendChild(tr);

    tr = $('tr'); th = $('th'); td = $('td');
    tr.dataset.parity = i%2 == 0 ? 'even' : 'odd'; i++;
    th.innerHTML = '포트';
    td.innerHTML = '';
    tr.appendChild(th); tr.appendChild(td); tbody.appendChild(tr);

    tr = $('tr'); th = $('th'); td = $('td');
    tr.dataset.parity = i%2 == 0 ? 'even' : 'odd'; i++;
    th.innerHTML = '설명';
    td.innerHTML = '';
    tr.appendChild(th); tr.appendChild(td); tbody.appendChild(tr);

    table.appendChild(tbody);
    wrap.appendChild(table);
    this.enableTableResizable(wrap);
    this.body.appendChild(wrap);
  }

  enableTableResizable(wrap: HTMLElement) {

    // add sash
    const sash = $('.table-sash');
    wrap.appendChild(sash);

    // add event handler
    sash.addEventListener('pointerdown', (e: PointerEvent) => {
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
    });

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