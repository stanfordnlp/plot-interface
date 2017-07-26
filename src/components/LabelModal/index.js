import React, { Component, PropTypes } from "react"
import { connect } from "react-redux"
import classnames from "classnames"
import Actions from "actions/world"
import Modal from "react-modal"

import "./styles.css"


class LabelModal extends Component {
  static propTypes = {
    /* Callback function when the CommandBar button clicks clicked */
    isOpen: PropTypes.bool,
    query: PropTypes.string,
    onClose: PropTypes.func,
    dispatch: PropTypes.func
  }

  constructor(props) {
    super(props)
    this.state = {isOpen: props.isOpen, onClose: props.onClose}
  }

  submit() {
    console.log('submit ' + this.props.query);
  }

  handleKeyDown(e) {
    if (e.keyCode === 13) {
      this.submit()
    } else if (e.keyCode === 40) {
      this.closeModal()
    }
  }

  render() {
    return (
      <Modal
        isOpen={true}
        // onRequestClose={this.state.onClose()}
        className={{
          base: 'LabelModal',
          afterOpen: 'LabelModal_after-open',
          beforeClose: 'LabelModal_before-close'
        }}
        overlayClassName={{
          base: 'Overlay',
          afterOpen: 'Overlay_after-open',
          beforeClose: 'Overlay_before-close'
        }}

        contentLabel="Example Modal"
        style={{content : {left:'800px'}}}
      >
      <span className="header">What happened in this chart?</span>
      <input className="label-box"
        type="text"
        placeholder={'previously: ' + this.props.query}
      />
      <div className='control-bar'>
        <button onClick={() => this.submit()}>Submit</button>
        <button onClick={() => this.state.onClose()}>Close</button>
      </div>
    </Modal>
    )
  }
}

const mapStateToProps = (state) => ({
  query: state.world.query,
})

export default connect(mapStateToProps)(LabelModal)
