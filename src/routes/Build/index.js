import React, { Component, PropTypes } from 'react'
import Actions from "actions/world"
import { connect } from "react-redux"
import Plot from "plot/Plot"
import { STATUS } from "constants/strings"
import Editor from "components/Editor"
import FormulasList from "components/FormulasList"
import VegaLite from "plot/VegaLite"
import SplitPane from 'react-split-pane';

import "./styles.css"

class Build extends Component {
  static propTypes = {
    /* Injected by Redux */
    status: PropTypes.string,
    context: PropTypes.object,
    responses: PropTypes.array,
    dispatch: PropTypes.func,
  }

  render() {
    const {responses } = this.props
    const seed = Math.random();
    console.log('seed', seed)
    let plots = responses.map((r, ind) =>
      (
        <Plot spec={r.value} formula={r.formula} key={ind + '_' + seed}/>
      )
    );

    let plotsPlus = [];
    if (this.props.showFormulas) {
      plotsPlus.push(
         <FormulasList formulas={responses.map(r => r.formula)}/>
      );
    }

    plotsPlus.push(
      <div className='current-plot' key='current'>
        <VegaLite
          spec={this.props.context}
          onError={() => {}}
        />
      </div>
    );

    plotsPlus = plotsPlus.concat(plots);
    return (
      <div style={{position: 'relative', height: `calc(100vh - ${50}px)`}}>
        <SplitPane split="vertical" minSize={100} defaultSize={window.innerWidth * 0.4} pane1Style={{display: 'flex'}} className='main-pane' pane2Style={{overflow: 'scroll'}}>
          <Editor/>
          <div className="Candidates">
            {plotsPlus}
          </div>
        </SplitPane>
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
  status: state.world.status,
  responses: state.world.responses,
  context: state.world.context,
  showFormulas: state.world.showFormulas,
})

export default connect(mapStateToProps)(Build)
