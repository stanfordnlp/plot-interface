import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import Actions from "actions/world"
import VegaLite from "../VegaLite"

import {MdClose, MdCheck, MdContentCopy, MdEdit} from 'react-icons/lib/md'
import "./styles.css"

class Plot extends React.Component {
  static propTypes = {
    spec: PropTypes.object,
    renderer: PropTypes.string,
    mode: PropTypes.string,
    dispatch: PropTypes.func,
  }

  constructor(props) {
    super(props)
    this.config = { iconSize: 20 }
  }


  accept() {
    this.props.dispatch(Actions.accept(this.props.spec));
    console.log('Plot.accept')
    console.log(this.props.spec)

  }

  renderChart() {
    const {iconSize} = this.config;
    const {spec} = this.props;
    return (
      <div className='chart-container'>
        <div className='chart-header'>
           <MdCheck className='chart-button' size={iconSize} onClick={() => this.accept()}/>
           <MdClose className='chart-button' size={iconSize}/>
           <MdEdit className='chart-button' size={iconSize}/>
           <MdContentCopy className='chart-button' size={iconSize}/>
        </div>
        <VegaLite spec={spec} />
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
})
export default connect(mapStateToProps)(Plot);
