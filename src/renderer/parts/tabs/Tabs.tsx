import React from 'react';
import { connect } from 'react-redux';
import Tab from './Tab';
import { Splittable } from '../../Types';
import { Terminal_, SplitItem, isTerminal, isSplitItem } from '../../Types';
import { v1 as uuid } from 'uuid';
interface TabsProps {
  list: Terminal_[];
}

interface TabsState {
}

class Tabs extends React.Component<TabsProps, TabsState> {
  componentDidMount() {}

  render() {
    const { list } = this.props;
    return (
      <div className="tabs">
        <div className="tabs-and-actions-container">
          <div className="scrollable-element">
            <div className="tablist">
              {
                list.map((e) => {
                  return (
                    <Tab terminal={e}
                      key={uuid()}
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
