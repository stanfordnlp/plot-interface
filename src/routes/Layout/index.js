import React, { Component } from 'react'
import { connect } from "react-redux"
import UserActions from "actions/user"
import Actions from "actions/world"
import Header from "components/Header"

import "normalize.css"
import "./styles.css"

// /* For Debugging: react perf tools to measure performance */
// import Perf from 'react-addons-perf'
// window.Perf = Perf
// window.Perf.start()

class Layout extends Component {
  componentDidMount() {
    /* Set the appropriate sessionId (either turker id or generated) */
    this.props.dispatch(Actions.clear())
    this.props.dispatch(Actions.getRandom())
    this.props.dispatch(UserActions.setSessionId())
  }

  render() {
    return (
      <div className="container">
        <Header query={this.props.location.query} />
        {this.props.children}
      </div>
    )
  }
}

export default connect()(Layout)
