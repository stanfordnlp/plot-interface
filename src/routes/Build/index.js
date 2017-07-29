import React, { Component, PropTypes } from 'react'
import { connect } from "react-redux"
import Plot from "plot/Plot"
import Editor from "components/Editor"
import FormulasList from "components/FormulasList"
import VegaLite from "plot/VegaLite"
import SplitPane from 'react-split-pane';
import Toolbar from 'components/Toolbar'
import LabelModal from 'components/LabelModal'
import {MdCheck} from 'react-icons/lib/md'

import "./styles.css"

class Build extends Component {
  static propTypes = {
    /* Injected by Redux */
    context: PropTypes.object,
    responses: PropTypes.array,
    dispatch: PropTypes.func,
  }

  // shouldComponentUpdate() {
  //   this.props.dispatch(Actions.setStatus('rendering'))
  //   return true
  // }

  onLabel = (spec, formula) => {
    this.labelModal.onLabel(spec, formula)
  };

  render() {
    const {responses } = this.props
    const seed = Math.random();
    console.log('seed', seed);
    let plots = responses.map((r, ind) =>
      (
        <Plot spec={r.value} formula={r.formula} key={ind + '_' + seed} onLabel={this.onLabel}/>
      )
    );

    let plotsPlus = [];
    if (this.props.showFormulas) {
      plotsPlus.push(
         <FormulasList formulas={responses.map(r => r.formula)}/>
      );
    }

    plotsPlus.push(
      <div className='chart-container' key='current'>
        <div className='chart-header'><b>Current plot</b></div>
        {
          'initialContext' in this.props.context?
          <div>click <MdCheck className='md-button' size={20}/> to select a plot</div>
          :
          <VegaLite
            spec={this.props.context}
            onError={() => {}}
          />
        }
      </div>
    );

    plotsPlus = plotsPlus.concat(plots);
    return (
      <div style={{position: 'relative', height: `calc(100vh - ${50}px)`}}>
        <SplitPane split="vertical" minSize={100} defaultSize={window.innerWidth * 0.35} pane1Style={{display: 'flex'}} className='main-pane' pane2Style={{overflow: 'scroll'}}>
          <Editor/>
          <div className="Candidates">
            {plotsPlus}
          </div>
        </SplitPane>
        <LabelModal onRef={ref => (this.labelModal = ref)}/>
        <Toolbar onLabel={this.onLabel}/>
      </div>
      // <div className="Build">
      //   <div className="Build-world">
      //     {plotsPlus}
      //   </div>
      //   <Editor/>
      // </div>
    );
  }
}


const mapStateToProps = (state) => ({
  responses: state.world.responses,
  context: state.world.context,
  showFormulas: state.world.showFormulas,
})

export default connect(mapStateToProps)(Build)
