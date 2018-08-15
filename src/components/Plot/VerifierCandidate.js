import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import Actions from 'actions/world'
// import config from 'config'
import InnerChart from './InnerChart'
import {canonicalJsonDiff} from "helpers/util"

// import ContextOverlay from './context-overlay'
import './candidate.css'

class Plot extends React.Component {
  static propTypes = {
    spec: PropTypes.object,
    dataURL: PropTypes.string,
    logger: PropTypes.object,
    formula: PropTypes.string,
    canonical: PropTypes.string,
    onLabel: PropTypes.func,
  }

  constructor(props) {
    super(props)
    const {logger} = this.props;
    const hasError = logger.warns.length > 0 || logger.errors.length > 0;
    this.config = { showTools: true, iconSize: 20}
    this.state = {
      hasError, ...props}
  }

  onPick() {
    const {spec, issuedQuery, plotData} = this.props
    this.props.dispatch(Actions.label(issuedQuery, spec, plotData.isExample? 'correct': 'wrong', 'pick'))
  }

  onLook() {
    this.props.onLabel(this.state.spec, this.props.issuedQuery)
  }

  render() {
    const equalMsg = this.state.isEqual? <li className='display-errors' key={'equalmsg'}>no change</li>: null
    const errors = this.state.logger.errors.map((v, i) => <li className='display-errors' key={'error'+i}>{v}</li>)
    const warns = this.state.logger.warns.map((v, i) => <li className='display-warns' key={'warn'+i}>{v}</li>)
    const {context, spec} = this.props
    return (
      <div className='chart-container'>
        <div className='chart-header button-row'>
          <button onClick={() => this.onLook()}>Look</button>
          <button onClick={() => this.onPick()}>Pick</button>
          {this.props.header}
        </div>
        <div className='canonical'>{canonicalJsonDiff(context, spec)}</div>
        <div>
          <div className='chart'>
            <InnerChart dataURL={this.state.dataURL}/>
          </div>
          <div>
          <ul> {[equalMsg, ...errors.concat(warns)]} </ul>
          </div>
        </div>
        {/* <LabelModal isOpen={this.state.labeling} spec={this.state.spec} onClose={() => this.closeModal()}/> */}
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  context: state.world.context,
  showErrors: state.world.showErrors,
  issuedQuery: state.world.issuedQuery,
})
export default connect(mapStateToProps)(Plot);
