import React, { Component } from "react"
import { connect } from "react-redux"
import classnames from "classnames"
import Actions from "actions/world"
import Modal from "react-modal"
import VegaLite from "plot/VegaLite"
import "./styles.css"

const headerText = 'Comparisons';
class LabelModal extends Component {

  constructor(props) {
    super(props)
    this.state = {
      inputValue: '',
      headerText: headerText,
    }
  }

  componentDidMount() {
    this.props.onRef(this)

  }
  componentWillUnmount() {
    this.props.onRef(null)
  }

  // note that props.issuedQuery is the query used to retrieve the original results
  // vs. props.query, which tracks the live value in query box
  onLabel(spec, formula) {
    this.setState({isOpen: true, spec: spec, formula: formula})
  }

  close() {this.setState({headerText: headerText, inputValue: '', isOpen: false})}

  submit(value) {
    if (value.trim().length === 0) {
      window.alert('cannot submit nothing')
      return
    }
    this.props.dispatch(Actions.label(value, this.state.spec));
    this.setState({headerText: `labeled this plot as "${value}"...` })
    setTimeout(() => {this.close()}, 800);
  }

  update(value) {
    this.props.dispatch(Actions.updateSpec());
    this.setState({headerText: `updating the current plot...` })
    setTimeout(() => {this.close()}, 200);
  }

  handleKeyDown(e) {
    if (e.keyCode === 13) {
      this.submit(this.state.inputValue)
    } else if (e.keyCode === 27) {
      this.close()
    }
  }

  updateInputValue(evt) {
    this.setState({inputValue: evt.target.value})
  }

  render() {
    return (
      <Modal
        isOpen={this.state.isOpen}
        onRequestClose={() => this.close()}
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
        // style={{content : {left:`${this.state.x}px`, top:`${this.state.y}px`}}}
      >
      <div className="header">{this.state.headerText}</div>
      <div className="before-after">
        <div className="before">
          <div className="label">"before"</div>
          <VegaLite spec={this.props.context}/>
        </div>
        <div className="before">
          <div className="label">"after"</div>
          <VegaLite spec={this.state.spec}/>
        </div>
      </div>
      <div className="info"><b>formula:</b> {this.state.formula}</div>
      <div className="info">Provide a command (in English) that changes "before" to "after":</div>
      <input autoFocus ref={(input) => { this.textInput = input; }} className="label-box"
        type="text"
        value={this.state.inputValue}
        onKeyDown={e => this.handleKeyDown(e)}
        onChange={e => this.updateInputValue(e)}
        placeholder={'Provide a command (in English) that should change "before" to "after":'}
      />
      <div className='control-bar'>
        <button className={classnames({active: true})} onClick={() => this.update()}>Update</button>
        <button className={classnames({active: this.state.inputValue.trim().length>0})} onClick={() => this.submit(this.state.inputValue)}>Submit (enter)</button>
        <button className={classnames({active: true})} onClick={() => this.close()}>Close (ESC)</button>
      </div>
    </Modal>
    )
  }
}

const mapStateToProps = (state) => ({
  issuedQuery: state.world.issuedQuery,
  context: state.world.context,
})

export default connect(mapStateToProps)(LabelModal)
