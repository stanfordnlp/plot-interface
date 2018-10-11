import React from "react"
import PropTypes from "prop-types"
import { NavLink as Link } from "react-router-dom"
import { Icon, Menu, Button } from 'semantic-ui-react'
import CommandBar from "../CommandBar/simple"
import "./styles.css"

const Header = ({ search }) => {
  // console.log(search)
  const activeItem = 'bio'
  return (
  <div className="Header">
    <Menu inverted attached='top'>
      {/* <Icon name="settings" size="large" link={true} styles={{margin: "10px"}}/> */}
      <CommandBar/>
    </Menu>
  </div>
  )
}

Header.propTypes = {
  /* URL parameters in order to persist the query (e.g ?turkid=AMT_123) across
   * route changes */
  query: PropTypes.object,
}

export default Header
