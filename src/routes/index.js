import React from "react"
import PropTypes from 'prop-types';
import { Router, Route, IndexRedirect } from "react-router"
import Layout from './Layout'
import Build from './Build';
import Help from "./Help"
import Label from "./Build/label.js"

const Routes = ({ history }) => (
  <Router history={history}>
    <Route path="/" component={Layout}>
      <IndexRedirect to="build" />
      <Route path="build" component={Build} />
      <Route path="help" component={Help} />
      <Route path="label" component={Label} />
    </Route>
  </Router>
)

Routes.propTypes = {
  /* History object for the router to interact with (e.g. hashHistory) */
  history: PropTypes.object
}

export default Routes
