import React, { Component } from 'react'
import { connect } from "react-redux"
import UserActions from "actions/user"
import Actions from "actions/world"
import LabelHeader from "components/Header/LabelHeader"

import "normalize.css"
import "./styles.css"

// /* For Debugging: react perf tools to measure performance */
// import Perf from 'react-addons-perf'
// window.Perf = Perf
// window.Perf.start()
//
// This is where turking stuff and URL parameters are handled

class Layout extends Component {
  componentDidMount() {
    /* Set the appropriate sessionId (either turker id or generated) */
    this.props.dispatch(UserActions.setSessionId())
    this.props.dispatch(Actions.clear())
  }

  render() {
    return (
      <div className="container">
        <LabelHeader query={this.props.location.query} />
        {this.props.children}
      </div>
    )
  }
}

export default connect()(Layout)
