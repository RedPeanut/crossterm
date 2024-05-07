import { Flex, IconButton } from '@chakra-ui/react';
import React from 'react';
import { BiCog } from 'react-icons/bi';
import { connect } from 'react-redux';

interface Props {
  // mapped value
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
        <div className='topbar-left'></div>
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
  return {};
};

const mapDispatchToProps = (dispatch: any) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(TopBar);
