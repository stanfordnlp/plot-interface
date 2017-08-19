import React, { PropTypes } from "react"
import { Router, Route, IndexRedirect } from "react-router"
import Layout from './Layout'
import Build from './Build';
import Help from "./Help"
import Label from "./Label"
import Examples from "./Examples"
const Routes = ({ history }) => (
  <Router history={history}>
    <Route path="/" component={Layout}>
      <IndexRedirect to="build" />
      <Route path="build" component={Build} />
      <Route path="help" component={Help} />
    </Route>
    <Route path="label" component={Label} />
    <Route path="examples" component={Examples} />
  </Router>
)

Routes.propTypes = {
  /* History object for the router to interact with (e.g. hashHistory) */
  history: PropTypes.object
}

export default Routes
