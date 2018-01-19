import React, {Component} from 'react'
import PropTypes from 'prop-types';
import { connect } from "react-redux"

import Editor from "components/Editor"
import SplitPane from 'react-split-pane';
import Toolbar from 'components/Toolbar'
import LabelModal from 'components/LabelModal'
import Candidates from './candidates.js'
import "./styles.css"

import UserActions from "actions/user"
import Actions from "actions/world"

class Build extends Component {
  static propTypes = {
    /* Injected by Redux */
    context: PropTypes.object,
    candidate: PropTypes.func,
    dispatch: PropTypes.func,
  }

  componentDidMount() {
    /* Set the appropriate sessionId (either turker id or generated) */
    const {dispatch} = this.props
    dispatch(UserActions.setSessionId())
    dispatch(Actions.clear())
    Promise.resolve(dispatch(Actions.initData())).then(() => {this.props.dispatch(Actions.getRandom())})
  }

  onLabel = (spec, formula) => {
    this.labelModal.onLabel(spec, formula)
  };

  render() {
    return (
      <div style={{position: 'relative', height: `calc(100vh - ${50}px)`}}>
        <SplitPane split="vertical" minSize={100} defaultSize={window.innerWidth * 0.35} pane1Style={{display: 'flex', height: "100%"}} className='main-pane' pane2Style={{overflow: 'scroll'}}>
          <Editor onLabel={this.onLabel}/>
          <Candidates onLabel={this.onLabel} candidate={this.props.candidate}/>
        </SplitPane>
        <LabelModal onRef={ref => (this.labelModal = ref)}/>
        <Toolbar onLabel={this.onLabel}/>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  isInitial: Object.keys(state.world.context).length === 0
})

export default connect(mapStateToProps)(Build)
