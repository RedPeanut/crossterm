import React from 'react';
import { connect } from 'react-redux';
import Tab from './Tab';
import { FlatItem } from '../../Types';
import { v4 as uuidv4 } from 'uuid';
import { drop } from 'lodash';

export type DropTargetType = { leftElementIndex: number | undefined; rightElementIndex: number | undefined } | undefined;

interface TabsProps {
  // list: Terminal_[];
  pid: string;
  children: FlatItem[];
}

interface TabsState {
  dropTarget: DropTargetType;
}

class Tabs extends React.Component<TabsProps, TabsState> {

  constructor(props: TabsProps) {
    super(props);
    this.state = {
      dropTarget: {
        leftElementIndex: undefined,
        rightElementIndex: undefined
      }
    }
  }

  componentDidMount() {}

  render() {
    const { children } = this.props;
    const { dropTarget } = this.state;

    return (
      <div className="tabs">
        <div className="tabs-and-actions-container">
          <div className="scrollable-element">
            <div className="tablist">
              {
                children.map((item, i) => {
                  let className: string = '';
                  if(dropTarget) {
                    if(dropTarget.leftElementIndex === i) className = 'drop-target-left';
                    if(dropTarget.rightElementIndex === i) className = 'drop-target-right';
                  }
                  return (
                    <Tab item={item}
                      key={uuidv4()}
                      /* related drop-target effect */
                      index={i} children={children}
                      className={className}
                      updateDropTarget={(dropTarget) => { this.setState({dropTarget: dropTarget}); }}
                    />
                  );
                })
              }
            </div>
          </div>
          <div className="actions"></div>
        </div>
        <div className="breadcrumbs-below-tabs"></div>
      </div>
    );
  }
}

export default connect(null, null)(Tabs);
