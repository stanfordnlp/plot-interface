import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import Actions from 'actions/world'
import hash from 'string-hash'
import InnerChart from './InnerChart'
import './candidate.css'

class Plot extends React.PureComponent {
  static propTypes = {
    spec: PropTypes.object,
    dataURL: PropTypes.string,
    logger: PropTypes.object,
    formula: PropTypes.string,
    showTools: PropTypes.bool,
    onLabel: PropTypes.func,
  }

  constructor(props) {
    super(props)
    const {logger} = this.props;
    const hasError = logger.warns.length > 0 || logger.errors.length > 0;
    this.config = { showTools: true, iconSize: 20}
    this.state = { isClosed: false, labeling: false, hasError, ...props}
  }

  accept() {
    this.props.dispatch(Actions.accept(this.props.spec, this.props.formula));
  }

  remove() {
    this.setState({isClosed: true})
  }

  onLabel() {
    // if ("initialContext" in this.props.context) {
    //   window.alert("No current plot, you need to pick one before you can label")
    //   return
    // }
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
        <div className='chart-header button-row'>
          {this.props.header}
          <button onClick={() => this.onLabel()}>Compare</button>
          {/* <button onClick={(e) => this.remove()}>Close</button> */}
          {/* <button onClick={(e) => {this.accept()}}>Accept</button> */}
        </div>
        <div className='canonical'>{this.props.formula}</div>
        <div>
          <div className='chart' onClick={e => this.onClick(e)}>
            <InnerChart dataURL={this.state.dataURL}/>
          </div>
          <div>
            <ul> {[equalMsg, ...errors.concat(warns)]} </ul>
          </div>
        </div>
      </div>
    )
  }

  render() {
    if (!this.props.showErrors && this.state.hasError)
      return null;
    if (this.state.isClosed)
      return null;
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
