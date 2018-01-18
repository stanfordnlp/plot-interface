import React, { Component } from "react"
import { connect } from "react-redux"
import Actions from "actions/world"
import Modal from "react-modal"
import VegaLite from "components/Plot/VegaLite"
import DiffEditor from './DiffEditor'
import {MdClose, } from 'react-icons/lib/md'
import SplitPane from 'react-split-pane';
import Mousetrap from 'mousetrap'
// import CurrentDataTable from 'components/DataTable/CurrentDataTable'
import "./styles.css"

const headerText = 'Editor';
class LabelModal extends Component {

  constructor(props) {
    super(props)
    this.state = {
      inputValue: props.issuedQuery,
      headerText: headerText,
      hasError: false,
      status: 'Make desired edits, label the action that takes "current" to "new", and accept when you are done.',
    }
  }

  componentDidMount() {
    this.props.onRef(this)

    Mousetrap.prototype.stopCallback = () => false;
    // Mousetrap.bind("enter", (e) => { e.preventDefault(); this.accept() })
    Mousetrap.bind("esc", (e) => { this.close() })
  }
  componentWillUnmount() {
    // Mousetrap.unbind("enter")
    Mousetrap.unbind("esc")
    this.props.onRef(null)
  }

  // note that props.issuedQuery is the query used to retrieve the original results
  // vs. props.query, which tracks the live value in query box
  onLabel(spec, formula) {
    this.setState({isOpen: true, spec: spec, formula: formula, inputValue: this.props.issuedQuery,})
  }

  close() {this.setState({headerText: headerText, inputValue: '', isOpen: false})}

  label(value) {
    if (this.state.hasError) {
      window.alert('there are errors in the spec, you have to fix them before you can accept')
      return
    }
    if (value.trim().length < 3) {
      window.alert('label is too short')
      return;
    }
    this.props.dispatch(Actions.label(value, this.state.spec));
    this.setState({inputValue: '', status: `You labeled the current example as "${value}". You can label again. `})

    // this.setState({headerText: `labeled this plot as "${value}"...` })
    // setTimeout(() => {this.close()}, 800);
  }

  accept() {
    if (this.state.hasError) {
      window.alert('there are errors in the spec, you have to fix them before you can accept')
      return
    }

    this.props.dispatch(Actions.accept(this.state.spec));
    this.close()
  }

  handleKeyDown(e) {
    if (e.keyCode === 13) {
      this.label(this.state.inputValue)
    } else if (e.keyCode === 27) {
      this.close()
    }
  }

  updateInputValue(evt) {
    this.setState({inputValue: evt.target.value})
  }

  render() {
    const style = {
      overlay: {
        display: 'flex',
        alignItems: 'center',
        backgroundColor: 'rgba(75,75,75,0.1)',
        justifyContent: 'center',
      },
      content: {
        // position: 'absolute',
        // overflow: 'hidden',
        top: '0px' , bottom: '0px', left: '0px', right: '0px',
        width: '100%',
        height: '100%',
        padding: '0px',
        borderRadius: '0px',
        // margin: '20px',
      }
    };
    const {context} = this.props
    const {spec} = this.state

    const isInitial = Object.keys(context).length === 0
    const promptString = isInitial? 'Provide a label to get this plot' : 'Provide a command that changes "current" to "new"'

    return (
      <Modal
        isOpen={this.state.isOpen}
        // onRequestClose={() => this.close()}
        style={style}
        contentLabel="label-modal"
        onKeyDown={e => this.handleKeyDown(e)}
        // style={{content : {left:`${this.state.x}px`, top:`${this.state.y}px`}}}
      >
      <div className="header">
        <MdClose className="md-button" size={'2em'} onClick={() => this.close()}/>
        <input autoFocus className="labelInput" ref={(input) => { this.textInput = input; }}
          type="text"
          value={this.state.inputValue}
          onKeyDown={e => this.handleKeyDown(e)}
          onChange={e => this.updateInputValue(e)}
          placeholder={promptString}
        />
        <button className='headerButton' onClick={() => this.label(this.state.inputValue)}>Label</button>
        <button className='headerButton' onClick={() => this.accept()}>Accept</button>
      </div>
      <div className="status">
        {this.state.status}
      </div>

      <div style={{position: 'relative', height: `calc(100vh - ${100}px)`}}>
        <SplitPane split="vertical" minSize={100} defaultSize={isInitial? '50%': '50%'} pane1Style={{display: 'flex', height: "100%"}} className='main-pane' pane2Style={{display: 'flex', height: "100%"}}>
          <SplitPane split="horizontal" minSize={100} defaultSize={'50%'} pane1Style={{display: 'flex', height: "100%", overflow: 'auto'}} className='main-pane' pane2Style={{display: 'flex', height: "100%"}}>
            <div>
                <div className="label">Current plot</div>
                {
                  Object.keys(context).length === 0?
                  'You have not picked a current plot yet, in this case, the label should be how you would refer to the new plot'
                    : <VegaLite spec={context} dataValues={this.props.dataValues}/>
                }
            </div>
            <DiffEditor readOnly={true} context={context} initial={context} update={() => {}}/>
          </SplitPane>
          <SplitPane split="horizontal" minSize={100} defaultSize={'50%'} pane1Style={{display: 'flex', height: "100%", overflow: 'auto'}} className='main-pane' pane2Style={{display: 'flex', height: "100%"}}>
              <div>
                <div className="label">New plot</div>
                {
                  !spec || Object.keys(spec).length === 0?
                  'The new plot is empty. You should probably pick something before editing directly.'
                    : <VegaLite spec={spec} dataValues={this.props.dataValues} onError={e => this.setState({hasError: e})}/>
                }
              </div>
              <DiffEditor readOnly={false} context={context} initial={spec} update={(spec) => this.setState({spec})}/>
          </SplitPane>
        </SplitPane>
      </div>
    </Modal>
    )
  }
}

const mapStateToProps = (state) => ({
  issuedQuery: state.world.issuedQuery,
  context: state.world.context,
  dataValues: state.world.dataValues,
  status: state.world.status,
})

export default connect(mapStateToProps)(LabelModal)
