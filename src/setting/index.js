import React from "react"
import specs from '../constants/specs'
import VegaLite from 'react-vega-lite';

import "./styles.css"

/* Must render the currentState */
const Setting = (props) => {
  console.log(props.blocks);
  return (
  <div>
    <span>Results returned {JSON.stringify(props.blocks)} </span>
    <VegaLite spec={props.blocks}/>
  </div>
)}

export default Setting
