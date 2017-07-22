import React from "react"
import Plot from './plot'
import "./styles.css"

/* Must render the currentState */
const Setting = (props) => {
  return (
  <div>
    <Plot spec={props.spec} onAccept={props.onAccept} renderer={"canvas"} error={false}/>
  </div>
)}

export default Setting
