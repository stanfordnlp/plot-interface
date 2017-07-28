import React from 'react';
import ReactDOM from 'react-dom';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import Actions from 'actions/world'
import VegaLite from '../VegaLite'
// import ContextOverlay from './context-overlay'
import {MdClose, MdCheck, MdCompare, MdEdit} from 'react-icons/lib/md'
import './styles.css'
import LabelModal from 'components/LabelModal'
import {vegaHash} from 'helpers/validate'

class Plot extends React.Component {
  static propTypes = {
    spec: PropTypes.object,
    formula: PropTypes.string,
    mode: PropTypes.string,
    showTools: PropTypes.bool,
    showErrors: PropTypes.bool,
  }

  componentWillReceiveProps(nextProps) {
    const {showErrors} = nextProps
    if (showErrors!==this.state.showErrors)
      this.setState({showErrors: showErrors})
  }

  constructor(props) {
    super(props)
    this.config = { showTools: true, iconSize: 20, ...props }
    this.state = { isClosed: false, hasError: false, labeling: false, ...props}
  }

  compare(showContext) {
    this.setState({overlay: showContext})
  }
  //

  accept() {
    this.props.dispatch(Actions.accept(this.props.spec));
  }

  remove() {
    this.props.dispatch(Actions.reject(this.props.spec));
    this.setState({isClosed: true})
  }

  // this is a horrible workaround to stop re-rendering of the whole component
  toggle = () => {
    this.contextOverlay.toggle() // do stuff
  };

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
               <MdEdit className='md-button' size={iconSize} onClick={(e) => {this.openModal()}}/>
                <div className="header-button-tooltip">
                    {'label this'}
                </div>
             </span>

             <span className='header-button'>
               <MdCompare className='md-button' size={iconSize} onClick={ (e) => {this.toggle()} } />
                <div className="header-button-tooltip">
                    {'compare with'}
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
        {this.getLabelModal()}
      </div>
    );
  }

  onDoneRendering(chart) {
    if (this.props.contextHash === vegaHash(chart)) {
      this.setState({hasError: true, isEqual: true})
    } else {
      this.setState({isEqual: false})
    }
    // else {
    //   this.setState({isEqual: 'not equal'})
    //   console.log('not equal', this.props.contextHash, vegaHash(chart))
    // }
  }

  onError() {
    this.setState({hasError: true})
  }

  getLabelModal() {
    if (this.state.labeling) {
      const rect = ReactDOM.findDOMNode(this).getBoundingClientRect()
      let yoffset = -150; // height of the modal
      if (rect.top < 150)
        yoffset = 150;
      return <LabelModal isOpen={true} spec={this.state.spec} x={rect.left} y={rect.top+yoffset} onClose={() => this.closeModal()}/>
    } else return null;
  }

  openModal() {
    this.setState({labeling: true})
  }
  closeModal() {
    this.setState({labeling: false})
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
  showErrors: state.world.showErrors,
})
export default connect(mapStateToProps)(Plot);
