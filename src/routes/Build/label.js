import React, {Component} from 'react'
import PropTypes from 'prop-types';
import { connect } from "react-redux"

import Editor from "components/Editor"
import SplitPane from 'react-split-pane';
import Toolbar from 'components/Toolbar'
import LabelModal from 'components/LabelModal'

import Candidates from './candidates.js'
import "./styles.css"

class Build extends Component {
  static propTypes = {
    /* Injected by Redux */
    context: PropTypes.object,
    responses: PropTypes.array,
    dispatch: PropTypes.func,
  }

  onLabel = (spec, formula) => {
    this.labelModal.onLabel(spec, formula)
  };

  render() {
    return (
      <div style={{position: 'relative', height: `calc(100vh - ${50}px)`}}>
        <SplitPane split="vertical" minSize={100} defaultSize={window.innerWidth * 0.35} pane1Style={{display: 'flex', height: "100%"}} className='main-pane' pane2Style={{overflow: 'scroll'}}>
          <Editor onLabel={this.onLabel}/>
          <Candidates onLabel={this.onLabel}/>
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
