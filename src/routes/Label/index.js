import React, { Component, PropTypes } from 'react'
import Actions from 'actions/world'
import { connect } from "react-redux"

import { STATUS } from "constants/strings"
import {vegaLiteToDataURLWithErrors} from 'helpers/vega-utils'
import hash from 'string-hash'
import classnames from 'classnames'
import { SEMPREquery } from 'helpers/sempre'
import {responsesFromExamples} from 'helpers/vega-utils'

import "./styles.css"

class Label extends Component {
  static propTypes = {
    /* Injected by Redux */
    context: PropTypes.object,
    responses: PropTypes.array,
    dispatch: PropTypes.func,
  }

  constructor(props) {
    super(props)

    // this is how to access URL parameters
    const location = props.routing.location || props.routing.locationBeforeTransitions
    const sessionId = location.query.uid

    this.config = {numCandidates: 75, maxShow: 5, countPerExample: 5, hint: '10', plotInd: null, ...location.query}

    this.state = {submitted: false, context: null, responses: [], sessionId}
  }

  componentDidMount() {
    responsesFromExamples().then(initial => {
      const plotInd = this.config.plotInd || Math.floor(Math.random() * initial.length);
      const context = initial[plotInd].value;
      console.log(context)
      // send the actual sempre command
      SEMPREquery({ q: ['random', this.config.numCandidates, context], sessionId: this.state.sessionId})
      .then((response) => {
        console.log('sempre returned', response)
        let candidates = response.candidates;
        if (candidates.length > this.config.numCandidates)
          candidates = candidates.slice(0, this.config.numCandidates)
        this.processPlotData(context, candidates)
      });
    }).catch(e => console.log('responseFromExamples', e))
  }

  // set state plotData
  processPlotData(context, responses) {
    const contextPromise = vegaLiteToDataURLWithErrors(context)
    console.log('processing %d responses', responses.length);
    this.props.dispatch(Actions.setStatus(STATUS.RENDERING))
    // if (responses.length === 0) return
    contextPromise.then(contextVega => {
      const contextHash = hash(contextVega.dataURL)
      let renderedSpecs = responses.map(r => {
        return vegaLiteToDataURLWithErrors(r.value)
          .then(vega => {return {dataURL:vega.dataURL, logger: vega.logger,
            dataHash:hash(vega.dataURL), formula:r.formula, canonical:r.canonical, spec:r.value, count:0}})
          .catch(e => console.log('processing vega error', e));
      });
      Promise.all(renderedSpecs).then( plotData => {
        // console.log('plotData', plotData);
        plotData = plotData.filter(p => p !== undefined)
        plotData = plotData.filter(p => p.logger.errors.length===0 && p.logger.warns.length===0 )
        plotData = plotData.filter(p => p.dataHash !== contextHash)
        let hashes = new Set();
        let uniques = [];
        for (let p of plotData) {
          if (!hashes.has(p.dataHash)) {
            hashes.add(p.dataHash)
            uniques.push(p)
          }
        }
        console.log('uniques', uniques.length)

        if (uniques.length > this.config.maxShow)
          uniques = uniques.slice(0, this.config.maxShow)

        const utterances = uniques.map(() => Array.from(''.repeat(this.config.countPerExample)));
        this.setState({plotData: uniques, context:context, contextDataURL:contextVega.dataURL, utterances})
      }).catch(e => console.log('plotData error', e))
    })
  }

  onChange(e, idx, uIdx) {
    const utterances = this.state.utterances.map((utt, sidx) => {
      if (idx !== sidx) return utt;
      utt[uIdx] = e.target.value
      return utt;
    });
    this.setState({ utterances: utterances });
  }

  submit() {
    console.log(this.state.utterances)
    for (const [ind, utt] of this.state.utterances.entries()) {
	  for (var i=0; i < utt.length; i++)
	  {  
		console.log(utt.length) 
       	if (utt.length < this.config.countPerExample || utt[i].trim().length === 0) {
        	window.alert(`you cannot label plot ${ind} with empty utterances`)
        	return
      	} 
	  }                                                                       
    }
    // TODO: checkmore stuff here, like no paren, token limit, etc.

    for (const [ind, utt] of this.state.utterances.entries()) {
      const r = this.state.plotData[ind] 
      for (var j=0; j < this.config.countPerExample; j++)
      {
      	const q = ['accept', {utterance: utt[j], targetFormula: r.formula, type: "overnight", context: this.state.context, targetValue: r.spec }]
      	SEMPREquery({ q: q, sessionId: this.state.sessionId }, () => { })
	  }
    }
    this.setState({submitted: true})
  }

  onClick(e) {
    console.log('plotHash', e.target, hash(e.target.src))
  }

  render() {
    if (this.state.context === null) return <div>waiting for server</div>

    const plots = this.state.plotData.map((r, ind) =>
      <div className='Label-diff' key={r.dataHash}>
        <div>plot {ind}</div>
        <div className="Label-before-after">
          <div className="Label-before">
            <div className="label">"before"</div>
            <div className='chart' onClick={e => this.onClick(e)}>
              <img ref='chartImg' className='chart-img' alt='rendering...' src={this.state.contextDataURL}/>
            </div>
          </div>
          <div className="Label-before">
            <div className="label">"after"</div>
            <div className='chart' onClick={e => this.onClick(e)}>
              <img ref='chartImg' className='chart-img' alt='rendering...' src={r.dataURL}/>
            </div>
          </div>
        </div>
        <div className="Label-info"><b>Formula Expression to Rephrase:</b> {r.canonical}</div>

        <input ref={(input) => { this.textInput = input; }} className="Label-input"
          type="text"
          onChange={e => this.onChange(e, ind, 0)}
          placeholder={'1. Provide a natural language command that transforms the plot from "before" to "after" here'}
        />

		<input ref={(input) => { this.textInput2 = input; }} className="Label-input"
          type="text"
          onChange={e => this.onChange(e, ind, 1)}
          placeholder={'2. Provide a natural language command that transforms the plot from "before" to "after" here'}
        />

		<input ref={(input) => { this.textInput3 = input; }} className="Label-input"
          type="text"
          onChange={e => this.onChange(e, ind, 2)}
          placeholder={'3. Provide a natural language command that transforms the plot from "before" to "after" here'}
        />

		<input ref={(input) => { this.textInput4 = input; }} className="Label-input"
          type="text"
          onChange={e => this.onChange(e, ind, 3)}
          placeholder={'4. Provide a natural language command that transforms the plot from "before" to "after" here'}
        /> 

		<input ref={(input) => { this.textInput5 = input; }} className="Label-input"
          type="text"
          onChange={e => this.onChange(e, ind, 4)}
          placeholder={'5. Provide a natural language command that transforms the plot from "before" to "after" here'}
        />

      </div>
    )

    if (!this.state.submitted) {
      return (
          <div className='Label'>
            <div>
              For each pair of plots, provide 5 commands, using full English sentences, that transform the BEFORE plot to the AFTER plot. A formula expression that describes the change is provided - your 5 commands should rephrase this expression to more naturally describe the change between the two plots. When you are done, please press the submit button.
              <button className={classnames({active: true})}
                onClick={() => this.submit()}>click here to submit</button>
            </div>
            {plots}
          </div>
      )
    } else {
      return (
        <div>
        You have completed this task, the code is
        <span> {hash(JSON.stringify([this.state.sessionId, this.state.utterances]))} </span>
        <br/>
        Copy the code and submit on mturk to finish this assignment
        </div>
      )
    }
  }
}
const mapStateToProps = (state) => ({
  routing: state.routing,
})

export default connect(mapStateToProps)(Label)