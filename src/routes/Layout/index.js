import React, { Component } from 'react'
import { connect } from "react-redux"
import UserActions from "actions/user"
import Actions from "actions/world"
import Header from "components/Header"
import dsUtils from 'helpers/dataset-utils'
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
    this.props.dispatch(Actions.clear())
    this.props.dispatch(UserActions.setSessionId())
    const datasetURL = this.props.location.query.dataset
    if (datasetURL === undefined) {
      this.props.dispatch(Actions.getRandom())
    } else {
      dsUtils.loadURL(this.props.location.query.dataset)
        .then(loaded => {
          const parsed = dsUtils.parseRaw(loaded.data),
           values = parsed.values,
           schema = dsUtils.schema(values)
          this.props.dispatch(Actions.setState({schema: schema, dataValues: values}))
          this.props.dispatch(Actions.getRandom())
        })
        .catch(function(err) {
          console.log(err)
        });
    }
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
