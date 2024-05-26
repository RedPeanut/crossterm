import React from 'react';
import { connect } from 'react-redux';
import Tab from './Tab';
import { FlatItem } from '../../Types';
import { v4 as uuidv4 } from 'uuid';

interface TabsProps {
  // list: Terminal_[];
  pid: string;
  children: FlatItem[];
}

interface TabsState {
}

class Tabs extends React.Component<TabsProps, TabsState> {
  componentDidMount() {}

  render() {
    const { children } = this.props;
    return (
      <div className="tabs">
        <div className="tabs-and-actions-container">
          <div className="scrollable-element">
            <div className="tablist">
              {
                children.map((item) => {
                  return (
                    <Tab item={item}
                      key={uuidv4()}
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
