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
import "./switch.css"

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
  overlay: true,
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
  }

  componentWillUnmount() {
    this.props.onRef(null)
  }

  // note that props.issuedQuery is the query used to retrieve the original results
  // vs. props.query, which tracks the live value in query box
  onLabel(spec, formula) {
    Mousetrap.prototype.stopCallback = () => false;
    if (!this.props.readOnly)
      Mousetrap.bind("enter", (e) => { e.preventDefault(); this.label(this.state.inputValue)})

    Mousetrap.bind("esc", (e) => { this.close() })
    this.setState({isOpen: true, spec: spec, formula: formula, inputValue: this.props.issuedQuery,})
  }

  close() {
    Mousetrap.unbind("enter")
    Mousetrap.unbind("esc")
    this.setState({isOpen: false, ...initialStates})
  }

  label(value) {
    let filter = {msg: undefined}

    if (this.state.hasError) {
      filter.msg = 'there are errors in the spec, you have to fix them'
      filter.type = 'alert'
    } else if (/[[\]{}\t":']/.test(value)) {
      filter.msg = 'do not use special characters such as []{}"\''
      filter.type = 'alert'
    } else if (value.trim().length === 0) {
      filter.type = 'alert'
      filter.msg = 'you tried to submit the empty string, which cannot be right'
    } else if (/new plot|the new|the current|current plot/.test(value.toLowerCase())) {
      filter.msg = 'do not use the words "old plot" and "new plot", just say how you make the new plot'
      filter.type = 'alert'
    }

    if (filter.msg !== undefined)
      this.props.dispatch(Actions.log({...filter, value}))

    if (filter.type === 'alert') {
      window.alert(filter.msg)
      return
    }

    if (value === 'no change') {
      this.props.dispatch(UserActions.increaseCount(config.noChangeScore))
      this.props.dispatch(Actions.log({type: 'no change', value}))
    } else {
      this.props.dispatch(Actions.label(value, this.state.spec, this.state.formula))
      .then((response) => {
        if (response) {
          this.props.dispatch(UserActions.increaseCount(1))
        } else
          window.alert('no response from server...')
      })
    }
    // this.setState({inputValue: '', status: `You labeled the current example as "${value}". You can label again. `})
    // this.setState({headerText: `labeled this plot as "${value}"...` })
    this.close();
  }

  handleChangeOverlay(evt) {
    this.setState({overlay: evt.target.checked})
  }

  handleShowHint(evt) {
    this.setState({showHint: evt.target.checked})
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
    const {context, readOnly} = this.props
    const {spec} = this.state

    const isInitial = Object.keys(context).length === 0
    const promptString = 'What is the command that transforms "old plot" to "new plot"?'

    const currentPlot = (
      <div className="half-panel">
        <div className="label">
          {this.state.overlay? 'new plot:' : 'old plot:'}
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

    // eslint-disable-next-line
    const sideBySide = (
      <SplitPane split="vertical" minSize={90} defaultSize={isInitial? '50%': '50%'} pane1Style={{display: 'flex', height: "100%"}} className='main-pane' pane2Style={{display: 'flex', height: "100%"}}>
        {!config.showDiffEditor? currentPlot :
          <HorizontalSplit top={currentPlot} bot={<DiffEditor readOnly={true} context={context} initial={context} update={() => {}}/>}/>}
        {!config.showDiffEditor? newPlot :
          <HorizontalSplit top={newPlot} bot={<DiffEditor readOnly={false} context={context} initial={spec} update={(spec) => this.setState({spec})}/>}/>}
      </SplitPane>
    )

    return (
      <Modal
        isOpen={this.state.isOpen}
        // onRequestClose={() => this.close()}
        style={style}
        contentLabel="label-modal"
        ariaHideApp={false}
        // style={{content : {left:`${this.state.x}px`, top:`${this.state.y}px`}}}
      >

      <div className="header button-row">
        <MdClose className="md-button" size={'2em'} onClick={() => this.close()}/>
        <input autoFocus className="labelInput" ref={(input) => { this.textInput = input; }}
          type="text"
          value={this.state.inputValue}
          onChange={e => this.updateInputValue(e)}
          placeholder={promptString}
        />
        {readOnly? null: <button className='headerButton' onClick={() => this.label(this.state.inputValue)}>Label</button>}
        {readOnly? null: <button className='headerButton' onClick={() => this.label('no change')}>No change</button>}
        <button className='headerButton' onClick={() => this.close()}>Close</button>
      </div>


      <div className="label">
        show old
        <div className="onoffswitch">
          <input type="checkbox" name="onoffswitch" className="onoffswitch-checkbox" id="myonoffswitch"
            checked={this.state.overlay}
            onChange={e => this.handleChangeOverlay(e)}/>
          <label className="onoffswitch-label" htmlFor="myonoffswitch"></label>
        </div>
        show new
      </div>

      <div style={{position: 'relative', height: `calc(100vh - ${50}px)`}}>
        {currentPlot}
        {/* */}
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
