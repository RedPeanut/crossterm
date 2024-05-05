import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';

interface Props {
  children?: React.ReactElement | React.ReactElement[];
}

const SampleFn = (props: Props) => {
  const { children } = props;

  const someFn = () => {};

  const asyncFn = async () => {};

  const [stateVal, setStateVal] = useState('stateVal');

  /* how to use store value in component..
  const someVal = useSelector((state) => state.sample.someVal);
  const dispatch = useDispatch();

  /* what is the effect..
  useEffect(() => {
    return () => {};
  }, [someVal]);

  /* what is the memo..
  const memo = useMemo(() => {
    return (
      <></>
    );
  }, [someVal]); */

  /* what is the callback.. */
  const callback = useCallback(() => {}, []);

  return (
    <div>
      { children }
    </div>
  );
};

export default SampleFn;
// export default connect(mapStateToProps, mapDispatchToProps)(SampleFn);
