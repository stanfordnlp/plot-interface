import React from "react"
import PropTypes from "prop-types"

// eslint-disable-next-line
import { Icon, Segment, Button } from 'semantic-ui-react'

import CommandBar from "../CommandBar/simple"

const Header = ({ search }) => {
  // console.log(search)
  return (
  <div className="Header">
    <div style={{
      left: "50px",
      top: "25px",
      position: "absolute",
    }}>
    <Icon name="question" size="big"/> </div>
    <CommandBar/>
  </div>
  )
}

Header.propTypes = {
  /* URL parameters in order to persist the query (e.g ?turkid=AMT_123) across
   * route changes */
  query: PropTypes.object,
}

export default Header
