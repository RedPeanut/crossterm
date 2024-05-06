import React from 'react';
import classnames from 'classnames';

// const { prefix } = window;
// console.log('prefix =', prefix);

interface SideIconProps {
  className?: string;
  title?: string;
  children?: React.ReactElement | React.ReactElement[];
  onClick?: React.MouseEventHandler<HTMLDivElement> | undefined;
}

function SideIcon(props: SideIconProps) {
  const { className, title, children } = props;

  const cls = classnames(className, 'control-icon-wrap', {});
  const onClickOne: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void
    = (e) => {}

  return (
    <div className={cls} title={title}
      onClick={props.onClick ? props.onClick : onClickOne}
    >
      {children}
      {/* <div className="badge"></div>
      <div className="active-item-indicator"></div> */}
    </div>
  );
}

// SideIcon.propTypes = {
//   className: PropTypes.string,
//   title: PropTypes.string,
// };

// SideIcon.defaultProps = {
//   className: '',
//   title: '',
// };

export default SideIcon;
