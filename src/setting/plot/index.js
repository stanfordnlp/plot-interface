import React from 'react';
import PropTypes from 'prop-types';
import * as vega from 'vega';
import Error from '../error';
import * as VegaConsts from '../../constants/vega'
import * as vl from 'vega-lite';
import {MdClose, MdCheck, MdContentCopy, MdEdit} from 'react-icons/lib/md'
import "./styles.css"

export default class Plot extends React.Component {
  static propTypes = {
    spec: PropTypes.object,
    renderer: PropTypes.string,
    mode: PropTypes.string,
    onAccept: PropTypes.func
  }

  constructor(props) {
    super(props)
    this.config = { iconSize: 20 }
  }

  renderVega(props) {
    this.refs.chart.style.width = this.refs.chart.getBoundingClientRect().width + 'px';
    let runtime;
    let view;
    try {
      let mod = props.spec;
      if (mod.data.url && !mod.data.url.startsWith(VegaConsts.DATAURL)) {
        mod.data.url = VegaConsts.DATAURL + mod.data.url;
      }
      const vegaSpec = vl.compile(mod).spec;
      console.log(vegaSpec);
      runtime = vega.parse(vegaSpec);
      view = new vega.View(runtime)
      .logLevel(vega.Warn)
      .initialize(this.refs.chart)
      .renderer(props.renderer)
      view.run();
    } catch (err) {
      console.log(err.toString());
      // throw err;
    }
    this.refs.chart.style.width = 'auto';
    // window.VEGA_DEBUG.view = view;
  }

  componentDidMount() {
    this.renderVega(this.props);
  }

  componentDidUpdate() {
    this.renderVega(this.props);
  }

  accept() {
    console.log('checking')

  }

  renderChart() {
    const {iconSize} = this.config;
    return (
      <div className='chart-container'>
        <div className='chart-header'>
           <MdCheck className='chart-button' size={iconSize} onClick={() => this.props.onAccept(this.props.spec)}/>
           <MdClose className='chart-button' size={iconSize}/>
           <MdEdit className='chart-button' size={iconSize}/>
           <MdContentCopy className='chart-button' size={iconSize}/>
        </div>
        <Error />
        <div className='chart'>
          <div ref='chart'>
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
