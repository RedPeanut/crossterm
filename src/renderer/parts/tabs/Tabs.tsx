import React from 'react';
import { connect } from 'react-redux';
import Tab from './Tab';
import { Splittable } from '../../Types';

interface TabsProps {}

class Tabs extends React.Component {
  componentDidMount() {}

  render() {
    const { ...rest } = this.props;
    return (
      <div className="tabs">
        <div className="tabs-and-actions-container">
          <div className="scrollable-element">
            <div className="tablist">
              <Tab />
              <Tab />
              <Tab />
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
