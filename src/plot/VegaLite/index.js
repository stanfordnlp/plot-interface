import React from 'react';
import PropTypes from 'prop-types';

import * as vega from 'vega';
import * as VegaConsts from '../../constants/vega'
import {parseWithErrors} from 'helpers/validate'
import "./styles.css"

// renders vegalite plot and display errors
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
    const {vegaSpec, logger} = parseWithErrors(nextProps.spec)
    const hasError = logger.warns.length > 0 || logger.errors.length > 0
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
      view.runAfter((v) => console.log('scenegraph2', this.refs.chart.innerHTML))

      // const prevView = view.scenegraph().root;
      // console.log('scenegraph2', prevView)
      // console.log('scenegraph2svg', prevView._svg.outerHTML  )
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

  }

  componentDidUpdate() {
    this.renderVega(this.state);
  }

  test(e) {
    console.log(this.refs.chart.children[0].toDataURL())
  }

  render() {
    const errors = this.state.logger.errors.map((v, i) => <li className='display-errors' key={i}>{v}</li>)
    const warns = this.state.logger.warns.map((v, i) => <li className='display-warns' key={i}>{v}</li>)
    return (
      <div>
        <div className='chart'>
          <div ref='chart' onClick={e => {this.test(e)}}>
          </div>
        </div>
        <div >
        {this.state.hasError?  <ul> {errors.concat(warns)} </ul> : null }
        </div>
      </div>
    )
  }
}
