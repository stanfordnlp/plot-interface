import React from "react"
import PropTypes from "prop-types"
import { NavLink as Link } from "react-router-dom"
import { connect } from "react-redux"
import CommandBar from "../CommandBar"

import "./styles.css"

const Header = ({ search }) => {
  // console.log(search)
  return (
  <div className="Header">
     <CommandBar/>
    {/* <div className="Header-logo">
      <span>Plotting</span>
      <span className="Header-sublogo">catch phrase</span>
    </div> */}
    <div className="Header-nav">
      <Link to={{ pathname: "/build", search: search}} activeClassName="active"><div>Plot</div></Link>
      <Link to={{ pathname: "/help", search: search}} activeClassName="active"><div>Help</div></Link>
    </div>
  </div>
  )
}

Header.propTypes = {
  /* URL parameters in order to persist the query (e.g ?turkid=AMT_123) across
   * route changes */
  query: PropTypes.object,
}

export default Header
