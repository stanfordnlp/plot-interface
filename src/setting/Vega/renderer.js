import React from 'react';
import PropTypes from 'prop-types';
import * as vega from 'vega';
import './index.css';
import specs from '../../constants/specs'
import VegaLite from 'react-vega-lite';

export default class Editor extends React.Component {
  static propTypes = {
    vegaSpec: PropTypes.object,
    renderer: PropTypes.string,
    mode: PropTypes.string
  }

  componentDidMount() {
    this.renderVega(this.props);
  }

  componentDidUpdate() {
    this.renderVega(this.props);
  }

  render() {
    return  <VegaLite spec={specs}/>
  }
}
