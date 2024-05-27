import React from 'react';
import { connect } from 'react-redux';
import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from '@chakra-ui/react'
import { setAdd } from 'renderer/reducers/app';

interface Props {
  // mapped value
  onSetAdd: any;
}
interface State {}

class Add extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
  }

  componentDidMount() {}

  onClose = () => {
    this.props.onSetAdd(false);
  }

  render() {
    return (
      <Modal isOpen={true} onClose={this.onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Modal Title</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {/* <Lorem count={2} /> */}
            <p>blar blar blar ...</p>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme='blue' mr={3} onClick={this.onClose}>
              Close
            </Button>
            <Button variant='ghost'>Secondary Action</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    )
  }
}

const mapStateToProps = (state: any) => {
  return {};
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    onSetAdd: (v: any) => dispatch(setAdd(v)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Add);

