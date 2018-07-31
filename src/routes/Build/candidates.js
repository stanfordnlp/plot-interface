import React, {Component} from 'react'
import PropTypes from 'prop-types';
import { connect } from "react-redux"
import hash from 'string-hash'

import Actions from 'actions/world'
import { STATUS } from "constants/strings"
import {vegaLiteToDataURLWithErrors} from 'helpers/vega-utils'

import "./styles.css"

class Candidates extends Component {
  static propTypes = {
    /* Injected by Redux */
    context: PropTypes.object,
    candidate: PropTypes.func,
    responses: PropTypes.array,
    dispatch: PropTypes.func,
  }

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
        const delay = i < 5 ? 0 : 10

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
              formula: r.formula,
              canonical: r.canonical,
              spec :r.value,
              rank: i,
              // changed, no dup, and no error
              noDup:  contextHash!==dataHash && !hashes.has(dataHash),
              noError: vega.logger.errors.length + vega.logger.warns.length === 0,
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
    let plots = [<div key='loading'>loading...</div>]
    if (this.state && this.state.plotData) {
      plots = this.state.plotData.filter(r => (showFormulas || (r.noError && r.noDup))).map((r, ind) => (
        <this.props.candidate
          key={ind+'_'+r.formula}
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
