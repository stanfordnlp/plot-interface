import React from "react"
import PropTypes from "prop-types"
import { Link } from "react-router"
import { connect } from "react-redux"
// import hash from 'string-hash'
import config from "config"
import "./styles.css"

const Header = ({ query, sessionId, dispatch, location, count }) => (
  <div className="Header">
    <div className="HeaderInfo">
      Labels provided: {count} / {config.numLabels}
    </div>
    <div className="HeaderInfo">
       {count >= config.numLabels? `You are done! copy this code and submit: ${btoa(JSON.stringify({sessionId, count}))} ` : 'Code will appear here after you are done'}
    </div>
    <div className="Header-nav">
      <Link to={{ pathname: "/label/build", query: query }} activeClassName="active"><div>Label</div></Link>
      {/* <Link to={{ pathname: "/label/help", query: query }} activeClassName="active"><div>Help</div></Link> */}
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
  route: state.location,
  count: state.user.count,
})

export default connect(mapStateToProps)(Header)
