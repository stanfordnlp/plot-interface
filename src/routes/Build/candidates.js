import React, {Component, PureComponent} from 'react'
import PropTypes from 'prop-types';
import { connect } from "react-redux"
import hash from 'string-hash'

import Actions from 'actions/world'
import { STATUS } from "constants/strings"
import {vegaLiteToDataURLWithErrors} from 'helpers/vega-utils'
import config from 'config'

import "./styles.css"

class Candidates extends PureComponent {
  static propTypes = {
    /* Injected by Redux */
    context: PropTypes.object,
    candidate: PropTypes.func,
    responses: PropTypes.array,
    dispatch: PropTypes.func,
  }

  constructor(props) {
    super(props)
    this.state = {
      plotData: []
    }
    this.numProcessed = 0
    this.numDistinct = 0
    this.indProcessing = 0
    this.hashes = new Set()
    const {context, dataValues} = this.props
    this.contextPromise = vegaLiteToDataURLWithErrors(context, dataValues)
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.responses !== this.props.responses) {
      this.numProcessed = 0
      this.numDistinct = 0
      this.indProcessing = 0
    }

    if (this.props.responses.length > 0 && this.indProcessing < this.props.responses.length && this.numDistinct < config.maxDisplay) {
      const endInd = Math.min(this.props.responses.length, this.indProcessing + config.processingInterval)
      this.processPlotData(this.indProcessing, endInd)
    }
  }

  // set state plotData
  processPlotData(start: Integer, end: Integer) {
    const {responses, context, dataValues } = this.props
    const {plotData} = this.state
    const {hashes} = this
    console.log(`processing responses ${start} to ${end} out of ${responses.length}`);

    // if (responses.length === 0) return
    this.contextPromise.then(contextVega => {
      const contextHash = hash(contextVega.dataURL)
      hashes.add(contextHash)

      for (let i = start; i < end; i++) {
        const r = responses[i]
        vegaLiteToDataURLWithErrors(r.value, dataValues)
          .then(vega => {
            const dataHash = hash(vega.dataURL);
            const p = {
              dataURL:vega.dataURL,
              logger: vega.logger,
              dataHash: dataHash,
              formula: r.formula,
              canonical: r.canonical,
              spec :r.value,
              rank: i,
              // changed, no dup, and no error
              noDup:  contextHash!==dataHash && !hashes.has(dataHash),
              noError: vega.logger.errors.length + vega.logger.warns.length === 0,
            }
            hashes.add(p.dataHash)
            console.log('processing', i)
            plotData[i] = p
            if (i == end - 1) {
                this.numProcessed = plotData.filter(p => p.rank).length
                this.numDistinct = plotData.filter(p => p.noDup && p.noError).length
                console.log('num distinct', this.numDistinct)
                this.indProcessing += config.processingInterval
                this.forceUpdate()
            }
          })
          .catch(e => console.log('processing vega error', e))
      }
    })
  }

  render() {
    const {showFormulas, responses} = this.props
    let plots = [<div key='loading'>loading...</div>]
    if (this.state && this.state.plotData) {
      plots = this.state.plotData.filter(r => (showFormulas || (r.noError && r.noDup))).map((r, ind) => (
        <this.props.candidate
          key={r.rank}
          header={`${showFormulas? r.rank : ''} ${r.noError? '': '(hasError)'} ${r.noDup? '': '(isSame)'}`}
          dataURL={r.dataURL}
          spec={r.spec}
          logger={r.logger}
          formula={r.formula}
          canonical={r.canonical}
          errorLogger={r.logger}
          onLabel={this.props.onLabel}
        />
        )
      )
    }

    let plotsPlus = [];
    if (showFormulas) {
      plotsPlus.push(
        <div className="debug" key="debug-table" style={{height:'400px', overflow: 'scroll'}}>
          <table>
            <tbody>
            {
              responses.map((c, r) => {
                return (
                  <tr key={r} className={r % 2 ? 'even' : 'odd'}>
                    <td>{r}</td>
                    <td>{c.canonical}</td>
                    <td>{c.prob.toPrecision(4)}</td>
                    <td>{c.score.toPrecision(4)}</td>
                  </tr>
                );
              })
            }
            </tbody>
          </table>
        </div>
      );
    }

    plotsPlus = plotsPlus.concat(plots);
    return (
      <div className="Candidates" ref={c => this.candidates = c}>
        {plotsPlus}
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

export default connect(mapStateToProps)(Candidates)
