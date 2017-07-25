import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import Actions from "actions/world"
import VegaLite from "../VegaLite"
import ContextOverlay from "./context-overlay"
import {MdClose, MdCheck, MdCompare, MdEdit} from 'react-icons/lib/md'
import "./styles.css"

class Plot extends React.Component {
  static propTypes = {
    spec: PropTypes.object,
    context: PropTypes.object,
    renderer: PropTypes.string,
    mode: PropTypes.string,
    showTools: PropTypes.bool
  }

  constructor(props) {
    super(props)
    this.config = { showTools: true, iconSize: 20, ...props }
    this.state = { overlay: false}
  }

  compare(showContext) {
    this.setState({overlay: showContext})
  }
  //

  accept() {
    this.props.dispatch(Actions.accept(this.props.spec));
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
             <MdCheck className='md-button' size={iconSize} onClick={() => this.accept()}/>
             <MdClose className='md-button' size={iconSize}/>
             <MdEdit className='md-button' size={iconSize}/>
             <MdCompare className='md-button' size={iconSize}
              onClick={this.toggle}
             />
          </div>
        : null}
        <div className='all-overlays'>
          <div className='overlay-container1'>
            <VegaLite spec={this.props.spec} />
          </div>
          <div className='overlay-container2'>
            <ContextOverlay show={this.state.overlay} onRef={ref => (this.contextOverlay = ref)} />
          </div>
        </div>
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
  context: state.world.context
})
export default connect(mapStateToProps)(Plot);
