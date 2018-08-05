import React from "react"
import PropTypes from "prop-types"
import { NavLink as Link } from "react-router-dom"
import { connect } from "react-redux"
// import hash from 'string-hash'
import config from "config"
import "./styles.css"

const Header = ({ search, sessionId, count }) => (
  <div className="Header">
    <div className="Header-info">
      Labels provided: {count} / {config.numLabels}
    </div>
    <div className="Header-info">
       {count >= config.numLabels? `You are done! copy this code and submit: ${btoa(JSON.stringify({sessionId, count}))} ` : 'Code will appear here after you are done'}
    </div>
    <div className="Header-info">
      {'make sure your id is correct: ' + JSON.stringify(sessionId)}
    </div>
    <div className="Header-nav">
      <Link to={{ pathname: "/label", search}} activeClassName="active"><div>Label</div></Link>
      {/* <Link to={{ pathname: "/label/help", query: query }} activeClassName="active"><div>Help</div></Link> */}
    </div>
  </div>
)

Header.propTypes = {
  /* URL parameters in order to persist the query (e.g ?turkid=AMT_123) across
   * route changes */
  query: PropTypes.object,
}

const mapStateToProps = (state) => ({
  sessionId: state.user.sessionId,
  count: state.user.count,
})

export default connect(mapStateToProps)(Header)
