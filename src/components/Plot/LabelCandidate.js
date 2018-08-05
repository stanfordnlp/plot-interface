import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import Actions from 'actions/world'
import hash from 'string-hash'
import config from 'config'
import InnerChart from './InnerChart'
// import ContextOverlay from './context-overlay'
import './candidate.css'

class Plot extends React.Component {
  static propTypes = {
    spec: PropTypes.object,
    dataURL: PropTypes.string,
    logger: PropTypes.object,
    formula: PropTypes.string,
    showTools: PropTypes.bool,
    onLabel: PropTypes.func,
    clickedLabel: PropTypes.bool,
  }

  constructor(props) {
    super(props)
    const {logger} = this.props;
    const hasError = logger.warns.length > 0 || logger.errors.length > 0;
    this.config = { showTools: true, iconSize: 20}
    this.state = {
      hasError, ...props}
  }

  accept() {
    this.props.dispatch(Actions.accept(this.props.spec, this.props.formula));
  }

  toggleRejection() {
    const {spec} = this.props;
    const {isRejected} = this.state;
    this.props.dispatch(Actions.reject(spec, isRejected))
    this.setState({isRejected: !this.state.isRejected})
  }

  onLabel() {
    this.setState({clickedLabel: true})
    this.props.onLabel(this.state.spec, this.state.formula)
  }

  onClick(e) {
    console.log('plotHash', hash(this.state.dataURL))
    // let newWindow = window.open(this.state.dataURL, '')
    // const img = new Image()
    // img.src = this.state.dataURL
    // newWindow.document.write(img.outerHTML)
  }

  renderChart() {
    const equalMsg = this.state.isEqual? <li className='display-errors' key={'equalmsg'}>no change</li>: null
    const errors = this.state.logger.errors.map((v, i) => <li className='display-errors' key={'error'+i}>{v}</li>)
    const warns = this.state.logger.warns.map((v, i) => <li className='display-warns' key={'warn'+i}>{v}</li>)

    return (
      <div className='chart-container'>
        <div className='chart-header'>
          <button onClick={() => this.onLabel()}>Label {this.state.clickedLabel? '(clicked)': ''}</button>
          {this.props.header}
        </div>
        {config.showFormula? <div className='canonical'>{this.props.canonical}</div> : null}
        <div>
          <div className='chart' onClick={e => this.onClick(e)}>
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

  render() {
    return (
      this.renderChart()
    );
  }
}

const mapStateToProps = (state) => ({
  // context: state.world.context,
  showErrors: state.world.showErrors,
})
export default connect(mapStateToProps)(Plot);
