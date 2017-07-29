import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import Actions from 'actions/world'
import VegaLite from '../VegaLite'
// import ContextOverlay from './context-overlay'
import {MdClose, MdCheck, MdCompare} from 'react-icons/lib/md'
import './styles.css'

class Plot extends React.Component {
  static propTypes = {
    spec: PropTypes.object,
    formula: PropTypes.string,
    mode: PropTypes.string,
    showTools: PropTypes.bool,
    showErrors: PropTypes.bool,
    onLabel: PropTypes.func,
  }

  componentWillReceiveProps(nextProps) {
    const {showErrors} = nextProps
    if (showErrors!==this.state.showErrors)
      this.setState({showErrors: showErrors})
  }

  constructor(props) {
    super(props)
    this.config = { showTools: true, iconSize: 20, ...props }
    this.state = { isClosed: false, hasError: false, isEqual: false, labeling: false, ...props}
  }

  accept() {
    this.props.dispatch(Actions.accept(this.props.spec, this.props.formula));
  }

  remove() {
    this.props.dispatch(Actions.reject(this.props.spec));
    this.setState({isClosed: true})
  }

  // this is a horrible workaround to stop re-rendering of the whole component
  toggle = () => {
    this.contextOverlay.toggle() // do stuff
  };

  onDoneRendering(dataURL) {
    if (this.props.contextHash === dataURL) {
      this.setState({hasError: true, isEqual: true})
    } else {
      this.setState({isEqual: false})
      //console.log('not equal', this.props.contextHash)
    }
  }

  onLabel() {
    if ("initialContext" in this.props.context) {
      window.alert("No current plot, you need to pick one before you can label")
      return
    }
    this.props.onLabel(this.state.spec, this.state.formula)
  }

  onError() {
    this.setState({hasError: true})
  }

  renderChart() {
    const {iconSize, showTools} = this.config;

    return (
      <div className='chart-container'>
        {showTools===true?
          <div className='chart-header'>
             <span className='header-button'>
                <MdClose className='md-button' size={iconSize} onClick={(e) => {this.remove()}}/>
                <div className="header-button-tooltip">
                    {'remove this'}
                </div>
             </span>
             <span className='header-button'>
               <MdCheck className='md-button' size={iconSize} onClick={(e) => {this.accept()}}/>
                <div className="header-button-tooltip">
                    {'use this'}
                </div>
             </span>

             <span className='header-button'>
               <MdCompare className='md-button' size={iconSize} onClick={(e) => {
                  this.onLabel()}
                } />
                <div className="header-button-tooltip">
                    {'compare and label'}
                </div>
             </span>
          </div>
        : <div className='chart-header'>{this.state.header}</div> }
        <div className='canonical'>{this.props.formula}</div>
        <VegaLite
          spec={this.props.spec}
          onError={() => {this.onError()}}
          onDoneRendering={dataURL => this.onDoneRendering(dataURL)}
        />
        {this.state.isEqual? <span>equal to original</span> : null}
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
  contextHash: state.world.contextHash,
  context: state.world.context,
  showErrors: state.world.showErrors,
})
export default connect(mapStateToProps)(Plot);
