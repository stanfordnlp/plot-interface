import React from "react"
import PropTypes from 'prop-types';
import { connect } from "react-redux"
import { Router, Route, IndexRedirect } from "react-router"
import Build from './Build';
import Help from "./Help"
import Label from "./Build/label.js"
import LabelHelp from "./Help/LabelHelp"

import Header from "components/Header"
import LabelHeader from "components/Header/LabelHeader"
import "normalize.css"
import "./styles.css"

const Routes = ({ history }) => (
  <Router history={history}>
    <Route path="/" component={(props) => (
      <div className="container">
        <Header query={props.location.query} />
        {props.children}
      </div>
    )}>
      <IndexRedirect to="build"/>
      <Route path="build" component={Build} />
      <Route path="help" component={Help} />
    </Route>

    <Route path="label" component={(props) => (
      <div className="container">
        <LabelHeader query={props.location.query} />
        {props.children}
      </div>
    )}>
      <IndexRedirect to="build"/>
      <Route path="build" component={() => <Build/>} />
      <Route path="help" component={LabelHelp} />
    </Route>
  </Router>
)

Routes.propTypes = {
  /* History object for the router to interact with (e.g. hashHistory) */
  history: PropTypes.object
}

export default connect()(Routes)
