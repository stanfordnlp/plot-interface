import React, { Component } from "react"
import { connect } from "react-redux"
import Actions from "actions/world"
import UserActions from "actions/user"
import Modal from "react-modal"
import VegaLite from "components/Plot/VegaLite"
import DiffEditor from './DiffEditor'
import {MdClose, } from 'react-icons/md'
import SplitPane from 'react-split-pane';
import Mousetrap from 'mousetrap'
import config from 'config'
// import CurrentDataTable from 'components/DataTable/CurrentDataTable'
import "./styles.css"

const headerText = 'Editor';
const HorizontalSplit = (props) => {
  return (
    <SplitPane split="horizontal" minSize={100} defaultSize={'50%'} pane1Style={{display: 'flex', height: "100%", overflow: 'auto'}} className='main-pane' pane2Style={{display: 'flex', height: "100%"}}>
      {props.top}
      {props.bot}
    </SplitPane>
  )
}

const initialStates = {
  inputValue: "",
  headerText: "",
  hasError: false,
  overlay: false,
  showHint: false,
}

class LabelModal extends Component {
  constructor(props) {
    super(props)
    this.state = {
      ...initialStates,
      inputValue: props.issuedQuery,
      headerText: headerText,
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

  close() {this.setState({isOpen: false, ...initialStates})}

  label(value) {
    if (this.state.hasError) {
      window.alert('there are errors in the spec, you have to fix them before you can accept')
      return
    } else if (/[[\]{}\t":.,']/.test(value)) {
      window.alert('should not contain special characters from JSON')
      return;
    } else if (value.trim().length < 5) {
      this.props.dispatch(Actions.log({msg: 'spam_label_too_short', value}));
      window.alert('too short to be valid')
      return;
    }  else if (value.trim().indexOf(' ') === -1) {
      this.props.dispatch(Actions.log({msg: 'spam_JSON_chars', value}));
      window.alert('should not only contain a single word')
      return;
    } else if (value.trim().indexOf(' ') === -1) {
      this.props.dispatch(Actions.log({msg: 'spam_single_word', value}));
      window.alert('should not be a single word')
      return;
    }

    this.props.dispatch(Actions.label(value, this.state.spec, this.state.formula));

    if (value === 'no change')
      this.props.dispatch(UserActions.increaseCount(0.1));
    else {
      this.props.dispatch(UserActions.increaseCount(1));
    }
    // this.setState({inputValue: '', status: `You labeled the current example as "${value}". You can label again. `})
    // this.setState({headerText: `labeled this plot as "${value}"...` })
    setTimeout(() => {this.close()}, 0);
  }

  accept() {
    if (this.state.hasError) {
      window.alert('there are errors in the spec, you have to fix them before you can accept')
      return
    }
    this.props.dispatch(Actions.accept(this.state.spec, this.state.formula ));
    this.close()
  }

  handleChangeOverlay(evt) {
    this.setState({overlay: evt.target.checked})
  }
  handleShowHint(evt) {
    this.setState({showHint: evt.target.checked})
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
        // alignItems: 'center',
        backgroundColor: 'rgba(75,75,75,0.1)',
        // justifyContent: 'center',
      },
      content: {
        // position: 'absolute',
        overflow: 'hidden',
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
    const promptString = 'What is the command that transforms "current plot" to "new plot"?'

    const currentPlot = (
      <div className="half-panel">
        <div className="label">
          Current plot
        </div>

        <div style={{top: '0px', paddingLeft: '100px', position: "relative"}}>
          <div className={this.state.overlay? "overlay-top" : "overlay-bot"} >
            <VegaLite spec={spec} dataValues={this.props.dataValues} bigSize={true}/>
          </div>
          <div className={this.state.overlay? "overlay-bot" : "overlay-top"} >
            <VegaLite spec={context} dataValues={this.props.dataValues} bigSize={true}/>
          </div>
        </div>
    </div>
    )

    const newPlot = (
      <div className="half-panel">
        <div className="label">
          New plot
        </div>
        <div style={{top: '0px', position: "relative", width: "100%"}}>
          <div className={"overlay-top"} >
            <VegaLite spec={spec} dataValues={this.props.dataValues} onError={e => this.setState({hasError: e})} bigSize={true}/>
          </div>
        </div>
      </div>
    )

    return (
      <Modal
        isOpen={this.state.isOpen}
        // onRequestClose={() => this.close()}
        style={style}
        contentLabel="label-modal"
        onKeyDown={e => this.handleKeyDown(e)}
        ariaHideApp={false}
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
        <button className='headerButton' onClick={() => this.label('no change')}>No change</button>
        <button className='headerButton' onClick={() => this.close()}>Close</button>
      </div>


      <div className="label">
        <input
          name="overlay"
          className="overlay-checkbox"
          type="checkbox"
          checked={this.state.overlay}
          onChange={e => this.handleChangeOverlay(e)}/> show "new plot" in place of "current plot"
      </div>
      <div className="label status">
        <input
          name="overlay"
          className="overlay-checkbox"
          type="checkbox"
          checked={this.state.showHint}
          onChange={e => this.handleShowHint(e)}/> show a hint {this.state.showHint? ': ' + this.state.formula : null}
      </div>

      <div style={{position: 'relative', height: `calc(100vh - ${100}px)`}}>
        <SplitPane split="vertical" minSize={90} defaultSize={isInitial? '50%': '50%'} pane1Style={{display: 'flex', height: "100%"}} className='main-pane' pane2Style={{display: 'flex', height: "100%"}}>
          {!config.showDiffEditor? currentPlot :
            <HorizontalSplit top={currentPlot} bot={<DiffEditor readOnly={true} context={context} initial={context} update={() => {}}/>}/>}
          {!config.showDiffEditor? newPlot :
            <HorizontalSplit top={newPlot} bot={<DiffEditor readOnly={false} context={context} initial={spec} update={(spec) => this.setState({spec})}/>}/>}
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
  schema: state.world.schema,
})

export default connect(mapStateToProps)(LabelModal)
