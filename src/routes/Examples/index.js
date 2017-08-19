import React, { Component } from 'react'
import { connect } from "react-redux"
import {responsesFromExamples} from 'helpers/vega-utils'
import Plot from "plot/Plot"
import {vegaLiteToDataURLWithErrors} from 'helpers/vega-utils'
import hash from 'string-hash'


import "./styles.css"

class Examples extends Component {
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
    responsesFromExamples().then(examples => {
      let renderedSpecs = examples.map(r => {
        return vegaLiteToDataURLWithErrors(r.value)
          .then(vega => {return {dataURL:vega.dataURL, logger: vega.logger,
            dataHash:hash(vega.dataURL), formula:r.canonical, spec:r.value, count:0}})
          .catch(e => console.log('processing vega error', e));
      });
      Promise.all(renderedSpecs).then( plotData => {
        plotData = plotData.filter(p => p !== undefined)
        this.setState({plotData: plotData})
      }).catch(e => console.log('plotData error', e))
    })
  }

  render() {
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

    return (
      <div style={{position: 'relative', height: `calc(100vh - ${50}px)`}}>
        <div className="Candidates" ref={c => this.candidates = c}>
           {plots}
         </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
})

export default connect(mapStateToProps)(Examples)
