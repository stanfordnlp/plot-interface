import React from "react"
import PropTypes from "prop-types"
// import { NavLink as Link } from "react-router-dom"
import { connect } from "react-redux"
// import hash from 'string-hash'
import config from "config"
import "./styles.css"

const Header = ({ search, sessionId, count }) => (
  <div className="Header Bigger">
    <div className="Header-info">
      Number verified : {count.toFixed(2)} / {config.numLabels}
    </div>
    <div className="Header-code">
       {count >= config.numLabels? `You are done! copy this code and submit: ${btoa(JSON.stringify({sessionId, count}))} ` : 'Code will appear here after you are done'}
    </div>
    <div className="Header-info">
      {'your id: ' + JSON.stringify(sessionId)}
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
