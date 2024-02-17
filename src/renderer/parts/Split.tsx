import React from 'react';
import './Split.css';

export interface SplitProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onDragEnd'> {
  style?: React.CSSProperties;
  className?: string;
  prefixCls?: string;
  /**
   * Drag width/height change callback function,
   * the width or height is determined according to the mode parameter
   */
  onDragging?: (preSize: number, nextSize: number, paneNumber: number) => void;
  /** Callback function for dragging end */
  onDragEnd?: (preSize: number, nextSize: number, paneNumber: number) => void;
  /** Support custom drag and drop toolbar */
  renderBar?: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element;
  /** Set the drag and drop toolbar as a line style. */
  lineBar?: boolean;
  /** Set the dragged toolbar, whether it is visible or not */
  visible?: boolean | number[];
  /**
   * Set the drag and drop toolbar, disable
   */
  disable?: boolean | number[];
  /**
   * type, optional `horizontal` or `vertical`
   */
  mode?: 'horizontal' | 'vertical';
}
export interface SplitState {
  dragging: boolean;
}

export default class Split extends React.Component<SplitProps, SplitState> {
  public static defaultProps: SplitProps = {
    prefixCls: 'split',
    visible: true,
    mode: 'horizontal',
  };
  public state: SplitState = {
    dragging: false,
  };
  public wrapper!: HTMLDivElement | null;
  public paneNumber!: number;
  public startX!: number;
  public startY!: number;
  public move!: boolean;
  public target!: HTMLDivElement;

  public boxWidth!: number;
  public boxHeight!: number;
  public prevWidth!: number;
  public nextWidth!: number;
  public prevHeight!: number;
  public nextHeight!: number;

  public prevSize!: number;
  public nextSize!: number;

  constructor(props: SplitProps) {
    super(props);
    this.onDragEnd = this.onDragEnd.bind(this);
    this.onDragging = this.onDragging.bind(this);
  }

  public componentDidMount() {
    console.log('this.wrapper =', this.wrapper);
  }

  public componentWillUnmount() {
    this.removeEvent();
  }

  private removeEvent() {
    window.removeEventListener('mousemove', this.onDragging, false);
    window.removeEventListener('mouseup', this.onDragEnd, false);
  }

  onMouseDown(paneNumber: number, e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    if(!e.target || !this.wrapper)
      return;

    this.paneNumber = paneNumber;
    this.startX = e.clientX;
    this.startY = e.clientY;
    this.move = true;
    this.target = (e.target as HTMLDivElement).parentNode as HTMLDivElement;
    const prevTarget = this.target.previousElementSibling;
    const nextTarget = this.target.nextElementSibling;
    this.boxWidth = this.wrapper.clientWidth;
    this.boxHeight = this.wrapper.clientHeight;
    if(prevTarget) {
      this.prevWidth = prevTarget.clientWidth;
      this.prevHeight = prevTarget.clientHeight;
    }
    if(nextTarget) {
      this.nextWidth = nextTarget.clientWidth;
      this.nextHeight = nextTarget.clientHeight;
    }
    window.addEventListener('mousemove', this.onDragging);
    window.addEventListener('mouseup', this.onDragEnd, false);
    this.setState({ dragging: true });
  }

  onDragging(e: Event) {
    if(!this.move)
      return;

    if(!this.state.dragging) {
      this.setState({ dragging: true });
    }
    const { mode, onDragging } = this.props;

    const prevTarget = this.target.previousElementSibling as HTMLDivElement;
    const nextTarget = this.target.nextElementSibling as HTMLDivElement;
    // console.log('prevTarget =', prevTarget);
    // console.log('nextTarget =', nextTarget);

    const x = (e as MouseEvent).clientX - this.startX;
    const y = (e as MouseEvent).clientY - this.startY;
    this.prevSize = 0;
    this.nextSize = 0;

    if(mode === 'horizontal') {
      this.prevSize = this.prevWidth + x > -1 ? this.prevWidth + x : 0;
      this.nextSize = this.nextWidth - x > -1 ? this.nextWidth - x : 0;
      if(this.prevSize === 0 || this.nextSize === 0)
        return;

      this.prevSize = (this.prevSize / this.boxWidth >= 1 ? 1 : this.prevSize / this.boxWidth) * 100;
      this.nextSize = (this.nextSize / this.boxWidth >= 1 ? 1 : this.nextSize / this.boxWidth) * 100;
      if(prevTarget && nextTarget) {
        prevTarget.style.width = `${this.prevSize}%`;
        nextTarget.style.width = `${this.nextSize}%`;
      }
    }

    if(mode === 'vertical' && this.prevHeight + y > -1 && this.nextHeight - y > -1) {
      this.prevSize = this.prevHeight + y > -1 ? this.prevHeight + y : 0;
      this.nextSize = this.nextHeight - y > -1 ? this.nextHeight - y : 0;
      this.prevSize = (this.prevSize / this.boxHeight >= 1 ? 1 : this.prevSize / this.boxHeight) * 100;
      this.nextSize = (this.nextSize / this.boxHeight >= 1 ? 1 : this.nextSize / this.boxHeight) * 100;
      if(this.prevSize === 0 || this.nextSize === 0)
        return;

      if(prevTarget && nextTarget) {
        prevTarget.style.height = `${this.prevSize}%`;
        nextTarget.style.height = `${this.nextSize}%`;
      }
    }
    onDragging && onDragging(this.prevSize, this.nextSize, this.paneNumber);
  }

  onDragEnd() {
    const { onDragEnd } = this.props;
    this.move = false;
    onDragEnd && onDragEnd(this.prevSize, this.nextSize, this.paneNumber);
    this.removeEvent();
    this.setState({ dragging: false });
  }
  render() {
    const {
      prefixCls,
      className,
      children,
      mode,
      visible,
      renderBar,
      lineBar,
      disable,
      onDragEnd,
      onDragging,
      ...other
    } = this.props;
    const { dragging } = this.state;
    const cls = [prefixCls, className, `${prefixCls}-${mode}`, dragging ? 'dragging' : null]
      .filter(Boolean)
      .join(' ')
      .trim();
    const child = React.Children.toArray(children);
    const count = React.Children.count(children);
    // console.log('count =', count);
    return (
      <div className={cls} {...other} ref={(node) => (this.wrapper = node)}>
        {
          React.Children.map(child, (element: any, idx: number) => {
            // console.log('idx =', idx);
            const props = Object.assign({}, element.props, {
              className: [`${prefixCls}-pane`, element.props.className].filter(Boolean).join(' ').trim(),
              style: { ...element.props.style },
            });
            const visibleBar = visible === true || (visible && visible.includes((idx+1) as never)) || false;
            const barProps = {
              className: [
                `${prefixCls}-bar`,
                lineBar ? `${prefixCls}-line-bar` : null,
                !lineBar ? `${prefixCls}-large-bar` : null,
              ]
                .filter(Boolean)
                .join(' ')
                .trim(),
            };
            if(disable === true || (disable && disable.includes((idx+1) as never))) {
              barProps.className = [barProps.className, disable ? 'disable' : null].filter(Boolean).join(' ').trim();
            }
            let bar = null;
            if(idx !== count && visibleBar && renderBar) {
              bar = renderBar({ ...barProps, onMouseDown: this.onMouseDown.bind(this, idx+1) });
            } else if(idx !== count && visibleBar) {
              bar = React.createElement(
                'div',
                { ...barProps },
                <div onMouseDown={this.onMouseDown.bind(this, idx+1)} />,
              );
            }
            return (
              <React.Fragment key={idx}>
                {React.cloneElement(element, { ...props })}
                {bar}
              </React.Fragment>
            );
          })
        }
      </div>
    );
  }
}
