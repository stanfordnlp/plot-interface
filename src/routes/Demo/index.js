import React, { Component, PropTypes } from 'react'
import { connect } from "react-redux"
import Actions from 'actions/world'
import Editor from "components/Editor"
import SplitPane from 'react-split-pane';
import LabelModal from 'components/LabelModal'
import classnames from 'classnames'
import {vegaLiteToDataURLWithErrors} from 'helpers/vega-utils'
import hash from 'string-hash'
import {prettyStringify, parseWithErrors} from "helpers/vega-utils"

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
    this.props.dispatch(Actions.getRandom())

    this.processPlotData()
  }
  componentDidUpdate(prevProps, prevState) {
    if (prevProps.responses === this.props.responses)
       return
    this.processPlotData()
  }

  // set state plotData
  processPlotData() {
    const {responses, dataValues } = this.props

    for (const r of responses)
    {
      const promise = vegaLiteToDataURLWithErrors(r.value, dataValues)
          .then(vega => {return {dataURL:vega.dataURL, logger: vega.logger,
            dataHash: hash(vega.dataURL), formula: r.canonical, spec :r.value, count:0}})
          .catch(e => console.log('processing vega error', e));
      console.log('in the loop')
      promise.then(s => {
          if (s === undefined) return;
          this.props.dispatch(Actions.setState({context: r.value, editorString: prettyStringify(r.value)}))
          this.setState({plotData: [s]})
      })
      break;
    }
  }

  updateSpec() {
    try {
      const spec = JSON.parse(this.props.editorString)
      const {logger} = parseWithErrors(spec)
      if (logger.warns.length > 0 || logger.errors.length > 0) {
        window.alert('current spec has errors, cannot be parsed')
        console.log('validation errors', logger)
        return
      }
      this.onLabel(spec, '(none)')
      // this.props.dispatch(Actions.updateSpec());
    } catch (e) {
      window.alert('error in spec (see console)')
      console.error('spec error', e);
    }
  }


  render() {
    let plots = [<div key='loading'>loading...</div>];

    if (this.state && this.state.plotData) {
      plots = this.state.plotData.map((r, ind) =>
        (
            <div className='chart' onClick={e => this.onClick(e)}>
              <img ref='chartImg' className='chart-img' alt='rendering...' src={r.dataURL}/>
            </div>
        ))
    }

    return (
      <div style={{position: 'relative', height: `calc(100vh)`}}>
        <SplitPane split="vertical" minSize={250} defaultSize={window.innerWidth * 0.4} pane1Style={{display: 'flex', height: "100%"}} className='main-pane' pane2Style={{overflow: 'scroll'}}>
          <Editor/>
          <div className="Candidates" ref={c => this.candidates = c}>
            {plots}
          </div>
        </SplitPane>
        <LabelModal onRef={ref => (this.labelModal = ref)}/>
        <div className='Toolbar'>
          <button className={classnames({active: true})} onClick={() => this.updateSpec()}>Label JSON Spec</button>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  editorString: state.world.editorString,
  responses: state.world.responses,
  context: state.world.context,
  dataValues: state.world.dataValues,
  showFormulas: state.world.showFormulas,
})

export default connect(mapStateToProps)(Demo)
