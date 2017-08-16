import React, { PropTypes } from "react"
import { Link } from "react-router"
import { connect } from "react-redux"
import CommandBar from "../CommandBar"

import "./styles.css"

const Header = ({ query, signedIn, sessionId, email, dispatch }) => (
  <div className="Header">
     <CommandBar/>
    {/* <div className="Header-logo">
      <span>Plotting</span>
      <span className="Header-sublogo">catch phrase</span>
    </div> */}
    <div className="Header-nav">
      <Link to={{ pathname: "/build", query: query }} activeClassName="active"><div>Plot</div></Link>
      <Link to={{ pathname: "/help", query: query }} activeClassName="active"><div>Help</div></Link>
    </div>
  </div>
)

Header.propTypes = {
  /* URL parameters in order to persist the query (e.g ?turkid=AMT_123) across
   * route changes */
  query: PropTypes.object,
  dispatch: PropTypes.func
}

const mapStateToProps = (state) => ({
  sessionId: state.user.sessionId,
  email: state.user.email,
  signedIn: state.user.signedIn
})

export default connect(mapStateToProps)(Header)
