import React, {Component} from 'react'
import PropTypes from 'prop-types';
import { connect } from "react-redux"
import Actions from 'actions/world'
import { STATUS } from "constants/strings"

import Plot from "plot/Plot"
import Editor from "components/Editor"
import FormulasList from "components/FormulasList"
import SplitPane from 'react-split-pane';
import Toolbar from 'components/Toolbar'
import LabelModal from 'components/LabelModal'
import {vegaLiteToDataURLWithErrors} from 'helpers/vega-utils'
import hash from 'string-hash'

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

  componentDidMount() {
    this.processPlotData()
  }
  componentDidUpdate(prevProps, prevState) {
    if (prevProps.responses === this.props.responses)
      return
    this.processPlotData()
  }

  // set state plotData
  processPlotData() {
    const {responses, context, dataValues } = this.props
    const contextPromise = vegaLiteToDataURLWithErrors(context, dataValues)
    this.setState({plotData: []})
    // console.log('processing %d responses', responses.length);

    // if (responses.length === 0) return
    contextPromise.then(contextVega => {
      const contextHash = hash(contextVega.dataURL)

      let plots = []
      let hashes = new Set()
      hashes.add(contextHash)

      for (let i = 0; i<responses.length; i++) {
        const r = responses[i]
        const delay = i > 3? Math.min((i-3)*100, 2000) : 0
        setTimeout( () => {
          if (i === responses.length - 1)
            this.props.dispatch(Actions.setStatus(STATUS.TRY))
          else
            this.props.dispatch(Actions.setStatus(`Rendering ${i+1} of ${responses.length}`))
          vegaLiteToDataURLWithErrors(r.value, dataValues)
          .then(vega => {
            const dataHash = hash(vega.dataURL);
            const p = {
              dataURL:vega.dataURL,
              logger: vega.logger,
              dataHash: dataHash,
              formula: r.canonical,
              spec :r.value,
              isIdentical: hashes.has(dataHash)
            }

            hashes.add(p.dataHash)
            plots[i] = p
            this.setState({plotData: plots})
            // console.log(i, r.canonical, isIdentical)
          })
          .catch(e => console.log('processing vega error', e))
        }, delay)
      }
    })
  }

  render() {
    const {showFormulas, responses} = this.props
    let plots = [<div key='loading'>loading...</div>];
    if (this.state && this.state.plotData) {
      plots = this.state.plotData.filter(p => showFormulas || !p.isIdentical).map((r, ind) =>
        (
          <Plot
            key={ind+'_'+r.dataHash}
            dataURL={r.dataURL}
            spec={r.spec}
            logger={r.logger}
            formula={r.formula}
            errorLogger={r.logger}
            onLabel={this.onLabel}
          />
        ))
    }

    let plotsPlus = [];
    if (showFormulas) {
      plotsPlus.push(
         <FormulasList key='formulasList' formulas={responses.map(r => `${r.canonical} : ${r.prob.toPrecision(4)}`)}/>
      );
    }

    plotsPlus = plotsPlus.concat(plots);
    return (
      <div style={{position: 'relative', height: `calc(100vh - ${50}px)`}}>
        <SplitPane split="vertical" minSize={100} defaultSize={window.innerWidth * 0.35} pane1Style={{display: 'flex', height: "100%"}} className='main-pane' pane2Style={{overflow: 'scroll'}}>
          <Editor onLabel={this.onLabel}/>
          <div className="Candidates" ref={c => this.candidates = c}>
            {plotsPlus}
          </div>
        </SplitPane>
        <LabelModal onRef={ref => (this.labelModal = ref)}/>
        <Toolbar onLabel={this.onLabel}/>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  responses: state.world.responses,
  context: state.world.context,
  dataValues: state.world.dataValues,
  showFormulas: state.world.showFormulas,
  isInitial: Object.keys(state.world.context).length === 0
})

export default connect(mapStateToProps)(Build)
