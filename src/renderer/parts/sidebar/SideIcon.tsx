import React from 'react';
import classnames from 'classnames';
import { connect } from 'react-redux';

// const { prefix } = window;
// console.log('prefix =', prefix);

interface SideIconProps {
  className?: string;
  title?: string;
  children?: React.ReactElement | React.ReactElement[];
  onClick?: React.MouseEventHandler<HTMLDivElement> | undefined;

  // mapped value
  sidePanel: any;
}

function SideIcon(props: SideIconProps) {
  const { className, title, children, sidePanel } = props;

  const cls = classnames(className, 'control-icon-wrap', sidePanel.active === title ? 'checked' : null);
  const onClickOne: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void
    = (e) => {}

  return (
    <div className={cls} title={title}
      onClick={props.onClick ? props.onClick : onClickOne}
    >
      { children }
      {/* <div className="badge"></div> */}
      <div className='active-item-indicator'></div>
    </div>
  );
}

const mapStateToProps = (state: any) => {
  return {
    sidePanel: state.app.sidePanel,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(SideIcon);
