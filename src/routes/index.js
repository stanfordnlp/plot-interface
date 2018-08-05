import React from "react"
import { connect } from "react-redux"
import { Route, Switch } from "react-router"
import {BrowserRouter as Router} from "react-router-dom"


import Build from './Build';
import LabelBuild from './Build/label'
import Help from "./Help"
// import Label from "./Label"
import LabelHelp from "./Help/LabelHelp"

import Candidate from "components/Plot/Candidate.js"
import LabelCandidate from "components/Plot/LabelCandidate.js"
import Viewer from "./Viewer"
import Header from "components/Header"
import LabelHeader from "components/Header/LabelHeader"
import Verifier from "./Build/verifier"

import UserActions from "actions/user"
import {getParameterByName} from "helpers/util"
import "normalize.css"
import "./styles.css"

class Routes extends React.Component {
  componentDidMount() {
    this.props.dispatch(UserActions.setSessionId(getParameterByName('uid')))
  }

  render() {
  return (
    <Router>
      <div>
        <Route path="/viewer" component={Viewer} />
        <Route path="/build" component={(props) => (
          <div className="container">
            <Header search={props.location.search}/>
            <Switch>
              <Route exact path="/build" component={() => <Build candidate={Candidate}/>}/>
              <Route exact path="/build/help" component={Help} />
            </Switch>
          </div>
        )}/>

        <Route path="/label" component={(props) => (
          <div className="container">
            <LabelHeader search={props.location.search}/>
            <Switch>
              <Route exact path="/label" component={() => <LabelBuild candidate={LabelCandidate}/>}/>
              <Route exact path="/label/help" component={Help} />
            </Switch>

          </div>
        )} />
        {/* <Route path="/label/help" component={LabelHelp} /> */}
        <Route path="verifier" component={() => <Verifier candidate={LabelCandidate}/>} />
      </div>
    </Router>
  )}
}

export default connect()(Routes)
