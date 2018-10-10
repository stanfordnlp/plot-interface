import React, {PureComponent} from 'react'
import PropTypes from 'prop-types';
import { connect } from "react-redux"
import hash from 'string-hash'
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
    verifierMode: PropTypes.bool,
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

  clear() {
    this.numProcessed = 0
    this.numDistinct = 0
    this.indProcessing = 0
    this.hashes = new Set()
    this.setState({plotData: []})
  }

  componentDidUpdate(prevProps, prevState) {
    const {responses} = this.props
    if (prevProps.responses !== responses) {
      this.clear()
      return
    }

    if (responses.length > 0 && this.indProcessing < responses.length && this.numDistinct < config.maxDisplay) {
      const endInd = Math.min(responses.length, this.indProcessing + config.processingInterval)
      this.processPlotData(this.indProcessing, endInd)
    }
  }

  componentWillUnmount() {
    this.clear()
  }

  // set state plotData
  processPlotData(start: Integer, end: Integer) {
    const {responses, dataValues} = this.props
    const {plotData} = this.state
    const {hashes} = this
    console.log(`processing responses ${start} to ${end} out of ${responses.length}`);

    this.contextPromise.then(contextVega => {
      const contextHash = hash(contextVega.dataURL)
      hashes.add(contextHash)

      for (let i = start; i < end; i++) {
        const r = responses[i]
        vegaLiteToDataURLWithErrors(r.value, dataValues)
          .then(vega => {
            const dataHash = hash(vega.dataURL);
            const p = {
              rank: i,
              dataURL:vega.dataURL,
              logger: vega.logger,
              dataHash: dataHash,
              candidate: r,
              // changed, no dup, and no error
              noDup:  contextHash !== dataHash && !hashes.has(dataHash),
              noError: vega.logger.errors.length + vega.logger.warns.length === 0,
            }
            hashes.add(p.dataHash)
            // console.log('processing', i, p.noDup, p.formula)
            plotData[i] = p
            this.numProcessed = plotData.filter(p => p.rank).length
            this.numDistinct = plotData.filter(p => p.noDup && p.noError).length
            if (i === end - 1 || this.numDistinct === config.maxDisplay) {
                // console.log('num distinct', this.numDistinct)
                this.indProcessing += config.processingInterval
                this.forceUpdate()
            }
          })
          .catch(e => console.log('error in vega', e))
      }
    })
  }

  render() {
    const {showFormulas, responses, onLabel, verifierMode} = this.props
    const {plotData} = this.state
    let plots = []
    if (this.state && plotData) {
      plots = plotData.filter(r => (showFormulas || (r.noError && r.noDup))).map((r, ind) => (
        <this.props.candidate
          key={r.rank}
          candidate={r.candidate}
          header={`${showFormulas? r.rank : ''} ${r.noError? '': '(hasError)'} ${r.noDup? '': '(isSame)'}`}
          dataURL={r.dataURL}
          logger={r.logger}
          plotData={r}
          onLabel={onLabel}
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
                    {/* <td>{c.prob.toPrecision(4)}</td> */}
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

    if (!showFormulas && plots.length > config.maxDisplay) {
      plots = plots.slice(0, config.maxDisplay)
    }

    // console.log(plots.length, config.maxDisplay, verifierMode)
    if (verifierMode === true && config.maxDisplay <= plots.length) {
      const example = plots[0]

      const rand = Math.floor(Math.random() * plots.length)
      plots[0] = plots[rand]
      plots[rand] = example
      plotsPlus = plotsPlus.concat(plots);
    } else if (verifierMode === undefined || verifierMode === false) {
      plotsPlus = plotsPlus.concat(plots);
    }

    return (
      <React.Fragment>
        {plotsPlus}
        {this.numDistinct < config.maxDisplay? <div>{`${this.numDistinct} out of ${config.maxDisplay} (testing ${this.numProcessed} out of ${responses.length})`}</div> : null}
      </React.Fragment>
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
