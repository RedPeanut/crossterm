import React from 'react';
import classnames from 'classnames';

// const { prefix } = window;
// console.log('prefix =', prefix);

interface SideIconProps {
  className?: string;
  title?: string;
  children?: React.ReactElement | React.ReactElement[];
}

function SideIcon(props: SideIconProps) {
  const { className, title, children } = props;

  const cls = classnames(className, 'control-icon-wrap', {});

  return (
    <div className={cls} title={title}>
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
