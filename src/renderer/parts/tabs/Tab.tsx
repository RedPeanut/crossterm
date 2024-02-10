import React from 'react';

interface TabProps {
  children?: React.ReactElement | React.ReactElement[];
}

const Tab = (props: TabProps) => {
  const { children } = props;

  const someFn = () => {};

  const asyncFn = async () => {};

  /* what is the effect..
  useEffect(() => {
    return () => {};
  }, [someVal]); */

  /* what is the memo..
  const memo = useMemo(() => {
    return (
      <></>
    );
  }, [someVal]); */

  /* what is the callback..
  const callback = useCallback(() => {}, []); */

  const onDragStart = (e) => {
    e.dataTransfer.setData('text/plain', JSON.stringify(''));
  };

  const findTargetGroupView = () => {
    //
  };

  const onDragEnter = (e: DragEvent) => {
    const target = e.target as HTMLElement;
    console.log('', target);
  };

  const onDrag = (e) => {};
  const onDragOver = (e) => {};
  const onDragLeave = (e) => {};
  const onDragExit = (e) => {};
  const onDrop = (e) => {};
  const onDragEnd = (e) => {};
  const handleContextMenu = (e) => {};

  return (
    <div className="tab"
      draggable
      onDragStart={onDragStart}
      onDragEnter={onDragEnter}
      onDrag={onDrag}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDragExit={onDragExit}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      onContextMenu={handleContextMenu}
    >
      탭입니다
    </div>
  );
};

export default Tab;
