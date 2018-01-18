import React from "react"
import PropTypes from "prop-types"
import { Link } from "react-router"
import { connect } from "react-redux"

import "./styles.css"

const Header = ({ query, signedIn, sessionId, email, dispatch, location }) => (
  <div className="Header">
    {/* <div className="Header-logo">
      <span>Plotting</span>
      <span className="Header-sublogo">catch phrase</span>
    </div> */}
    <div className="Header-nav">
      <Link to={{ pathname: "/label/build", query: query }} activeClassName="active"><div>Label</div></Link>
      <Link to={{ pathname: "/label/help", query: query }} activeClassName="active"><div>Help</div></Link>
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
  signedIn: state.user.signedIn,
  route: state.location,
})

export default connect(mapStateToProps)(Header)
