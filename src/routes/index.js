import React from "react"
import PropTypes from 'prop-types';
import { Router, Route, IndexRedirect } from "react-router"
import Build from './Build';
import Help from "./Help"
import Label from "./Build/label.js"
import Layout from "./Layout"
import LabelLayout from "./Layout/LabelLayout"
import LabelHelp from "./Help/LabelHelp"

const Routes = ({ history }) => (
  <Router history={history}>
    <Route path="/" component={Layout}>
      <IndexRedirect to="build"/>
      <Route path="build" component={Build} />
      <Route path="help" component={Help} />
    </Route>
    <Route path="label" component={LabelLayout}>
      <IndexRedirect to="build"/>
      <Route path="build" component={Label} />
      <Route path="help" component={LabelHelp} />
    </Route>
  </Router>
)

Routes.propTypes = {
  /* History object for the router to interact with (e.g. hashHistory) */
  history: PropTypes.object
}

export default Routes
