import React from 'react';
import Tab from './Tab';
import { Splittable } from '../../Types';

export default class Tabs extends React.Component {
  componentDidMount() {}

  render() {
    return (
      <div className="tabs">
        <div className="tabs-and-actions-container">
          <div className="scrollable-element">
            <div className="tablist tabs-container">
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
