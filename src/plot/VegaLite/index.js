import React from 'react';
import PropTypes from 'prop-types';

import * as vega from 'vega';
import Error from '../error';
import * as VegaConsts from '../../constants/vega'
import * as vl from 'vega-lite';
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
      renderer: VegaConsts.RENDERERS.Canvas,
      iconSize: 20
    }

    this.config = {...defaultProps, ...this.props }
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
      .renderer(this.config.renderer)
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

  render() {
    return (
      <div>
        <Error />
        <div className='chart'>
          <div ref='chart'>
          </div>
        </div>
      </div>
    );
  }
}
