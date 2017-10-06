import React, { Component, PropTypes } from 'react'
import { connect } from "react-redux"
import Actions from 'actions/world'
import { STATUS } from "constants/strings"

import Plot from "plot/Plot"
import Editor from "components/Editor"
import FormulasList from "components/FormulasList"
import VegaLite from "plot/VegaLite"
import SplitPane from 'react-split-pane';
import LabelModal from 'components/LabelModal'
import {MdCheck} from 'react-icons/lib/md'
import {vegaLiteToDataURLWithErrors} from 'helpers/vega-utils'
import hash from 'string-hash'

import "./styles.css"

class Demo extends Component {
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

    // console.log('processing %d responses', responses.length);
    this.props.dispatch(Actions.setStatus(STATUS.RENDERING))
    // if (responses.length === 0) return
    contextPromise.then(contextVega => {
      const contextHash = hash(contextVega.dataURL)
      let renderedSpecs = responses.map(r => {
        return vegaLiteToDataURLWithErrors(r.value, dataValues)
          .then(vega => {return {dataURL:vega.dataURL, logger: vega.logger,
            dataHash: hash(vega.dataURL), formula: r.canonical, spec :r.value, count:0}})
          .catch(e => console.log('processing vega error', e));
      });
      // console.log('contexhash', contextHash)
      Promise.all(renderedSpecs).then( plotData => {
        // console.log('plotData', plotData);
        plotData = plotData.filter(p => p !== undefined)
        plotData = plotData.filter(p => p.dataHash !== contextHash)
        let hashes = new Set();
        let uniques = [];
        for (let p of plotData) {
          if (!hashes.has(p.dataHash)) {
            hashes.add(p.dataHash)
            uniques.push(p)
          }
        }
        this.setState({plotData: uniques})
        this.props.dispatch(Actions.setStatus(STATUS.TRY))
      }).catch(e => console.log('plotData error', e))
    })
  }

  render() {
    const {responses} = this.props
    let plots = [<div key='loading'>loading...</div>];
    if (this.state && this.state.plotData) {
      plots = this.state.plotData.map((r, ind) =>
        (
          <Plot
            key={r.dataHash+'_'+r.formula}
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
    if (this.props.showFormulas) {
      plotsPlus.push(
         <FormulasList formulas={responses.map(r => r.canonical)}/>
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
            dataValues={this.props.dataValues}
            onError={() => {}}
          />
        }
      </div>
    );

    plotsPlus = plotsPlus.concat(plots);
    return (
      <div style={{position: 'relative', height: `calc(100vh - ${50}px)`}}>
        <SplitPane split="vertical" minSize={100} defaultSize={window.innerWidth * 0.35} pane1Style={{display: 'flex', height: "100%"}} className='main-pane' pane2Style={{overflow: 'scroll'}}>
          <Editor/>
          <div className="Candidates" ref={c => this.candidates = c}>
            {plotsPlus}
          </div>
        </SplitPane>
        <LabelModal onRef={ref => (this.labelModal = ref)}/>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  responses: state.world.responses,
  context: state.world.context,
  dataValues: state.world.dataValues,
  showFormulas: state.world.showFormulas,
})

export default connect(mapStateToProps)(Demo)
