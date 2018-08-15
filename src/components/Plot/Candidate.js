import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import Actions from 'actions/world'
import hash from 'string-hash'

// import ContextOverlay from './context-overlay'
// eslint-disable-next-line
import {MdClose, MdCheck,} from 'react-icons/md'
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
    this.props.dispatch(Actions.reject(this.props.spec));
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
    const {iconSize, showTools} = this.config;
    const equalMsg = this.state.isEqual? <li className='display-errors' key={'equalmsg'}>no change</li>: null
    const errors = this.state.logger.errors.map((v, i) => <li className='display-errors' key={'error'+i}>{v}</li>)
    const warns = this.state.logger.warns.map((v, i) => <li className='display-warns' key={'warn'+i}>{v}</li>)

    return (
      <div className='chart-container'>
        {showTools===true?
          <div className='chart-header'>
             {/* <span className='header-button'>
                <MdClose className='md-button' size={iconSize} onClick={(e) => {this.remove()}}/>
                <div className="header-button-tooltip">
                    {'Reject'}
                </div>
             </span> */}
             <span className='header-button'>
               <MdCheck className='md-button' size={iconSize} onClick={(e) => {this.accept()}}/>
                <div className="header-button-tooltip">
                    {'use this'}
                </div>
             </span>

             {/* <span className='header-button'>
               <MdCheck className='md-button' size={iconSize} onClick={(e) => {
                  this.onLabel()}
                } />
                <div className="header-button-tooltip">
                    {'edit and accept'}
                </div>
             </span> */}
          </div>
        : <div className='chart-header'>{this.state.header}</div> }
        <div className='canonical'>{this.props.canonical}</div>
        <div>
          <div className='chart' onClick={e => this.onClick(e)}>
            <img ref='chartImg' className='chart-img' alt='rendering...' src={this.state.dataURL}/>
          </div>
          <div >
          <ul> {[equalMsg, ...errors.concat(warns)]} </ul>
          </div>
        </div>
        {/* <LabelModal isOpen={this.state.labeling} spec={this.state.spec} onClose={() => this.closeModal()}/> */}
      </div>
    );
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
  context: state.world.context,
  showErrors: state.world.showErrors,
})
export default connect(mapStateToProps)(Plot);
