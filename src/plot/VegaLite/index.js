import React from 'react';
import PropTypes from 'prop-types';

import * as vega from 'vega';
import * as VegaConsts from '../../constants/vega'
import {parseWithErrors} from 'helpers/validate'
import "./styles.css"

export default class VegaLite extends React.Component {
  static propTypes = {
    spec: PropTypes.object,
    renderer: PropTypes.string,
    dispatch: PropTypes.func
  }

  constructor(props) {
    super(props)
    const defaultProps = {
      renderer: VegaConsts.RENDERERS.Canvas, //VegaConsts.RENDERERS.SVG | Canvas
      iconSize: 20
    }

    this.config = {...defaultProps, ...this.props }
    if (props.spec === undefined) {
      console.log('VegaLite undefined sepc');
    }
    const {vegaSpec, logger} = parseWithErrors(props.spec)
    const hasError = logger.warns.length > 0 || logger.errors.length > 0
    this.state = {vegaSpec: vegaSpec, logger: logger, hasError: hasError}
  }

  componentWillReceiveProps(nextProps) {
    const mod = nextProps.spec;
    if (mod.data.url && !mod.data.url.startsWith(VegaConsts.DATAURL)) {
      mod.data.url = VegaConsts.DATAURL + mod.data.url;
    }
    const {vegaSpec, logger} = parseWithErrors(mod)
    const hasError = logger.warns.length > 0
    this.setState({vegaSpec: vegaSpec, logger: logger, hasError: hasError})
  }

  renderVega(state) {
    // if (this.state.hasError) return;
    this.refs.chart.style.width = this.refs.chart.getBoundingClientRect().width + 'px';
    let runtime;
    let view;
    try {
      runtime = vega.parse(this.state.vegaSpec);
      view = new vega.View(runtime)
      .logLevel(vega.Warn)
      //.initialize()
      .initialize(this.refs.chart)
      .renderer(this.config.renderer);
      view.run()

      // view.toSVG().then(svg => {console.log('renderVega.toSVG %s', svg)})
      // this.setState({view: view});
      // console.log(view.scenegraph())
      // console.log(view._runtime)
    } catch (err) {
      console.log('VegaLite.error %s', err.toString());
      // throw err;
    }
    this.refs.chart.style.width = 'auto';


    // window.VEGA_DEBUG.view = view;
  }

  componentDidMount() {
    this.renderVega(this.state);
    // try {
    //   this.state.view.toSVG()
    //   .then(svg => {this.setState({svg: svg}); console.log('resolving promise')})
    //   .catch(err => {console.log(err.toString())})
    // } catch (err) {
    //   console.log(err.toString());
    //   // throw err;
    // }
  }

  componentDidUpdate() {
    this.renderVega(this.state);
  }

  render() {
    // if (this.state.hasError) return (
    //   <div ref='chart'>{[...this.state.logger.errors, ...this.state.logger.warns]}</div>
    // )
    const errorwarnings = this.state.logger.errors.concat(this.state.logger.warns);
    return (
      <div>
        <div className='chart'>
          <div ref='chart'>
          </div>
        </div>
        <div className='display-errors'>
        {this.state.hasError?  errorwarnings : "clean" }
        </div>
      </div>
    )
  }
}
