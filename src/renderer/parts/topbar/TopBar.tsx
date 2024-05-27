import React from 'react';
import { connect } from 'react-redux';
import { Flex, IconButton } from '@chakra-ui/react';
import { BiCog, BiPlus } from 'react-icons/bi';
import { setAdd } from 'renderer/reducers/app';

interface Props {
  // mapped value
  add: any, onSetAdd: any
}
interface State {}

class TopBar extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
  }

  componentDidMount() {}

  render() {
    return (
      <div className='parts topbar'>
        <Flex className='topbar-left'>
          <IconButton
            aria-label="Add"
            icon={<BiPlus size={16} />}
            onClick={() => { this.props.onSetAdd(true); }}
            variant="ghost"
          />
        </Flex>
        <div className='topbar-center'>
          <div className='window-title'>crossterm</div>
        </div>
        <Flex className='topbar-right'
          justifyContent='flex-end'
          alignItems='center'
        >
          <IconButton
            aria-label='Settings'
            icon={<BiCog size={16} />}
          />
        </Flex>
      </div>
    );
  }
}

const mapStateToProps = (state: any) => {
  return {
    add: state.app.add
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    onSetAdd: (v: any) => dispatch(setAdd(v)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(TopBar);
