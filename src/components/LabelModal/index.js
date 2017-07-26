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
    spec: PropTypes.object,
    onClose: PropTypes.func,
    dispatch: PropTypes.func
  }

  constructor(props) {
    super(props)
    this.state = {
      isOpen: props.isOpen,
      onClose: props.onClose,
      x: 400, y: 300,
      inputValue: '',
    ...props}
  }

  submit() {
    this.props.dispatch(Actions.label(this.state.inputValue, this.props.spec));
    this.state.onClose()
  }

  handleKeyDown(e) {
    if (e.keyCode === 13) {
      this.submit()
    } else if (e.keyCode === 27) {
      this.state.onClose()
    }
  }

  updateInputValue(evt) {
    this.setState({inputValue: evt.target.value})
  }

  render() {
    return (
      <Modal
        isOpen={true}
        onRequestClose={() => this.state.onClose()}
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

        contentLabel="label-modal"
        style={{content : {left:`${this.state.x}px`, top:`${this.state.y}px`}}}
      >
      <span className="header">What happened in this chart?</span>
      <input className="label-box"
        type="text"
        value={this.state.inputvalue}
        onKeyDown={e => this.handleKeyDown(e)}
        onChange={e => this.updateInputValue(e)}
        placeholder={'previous command: ' + this.props.query}
      />
      <div className='control-bar'>
        <button className={classnames({active: true})} onClick={() => this.submit()}>Submit</button>
        <button className={classnames({active: true})} onClick={() => this.state.onClose()}>Close</button>
      </div>
    </Modal>
    )
  }
}

const mapStateToProps = (state) => ({
  query: state.world.query,
})

export default connect(mapStateToProps)(LabelModal)
