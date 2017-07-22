import React, { Component, PropTypes } from 'react'
import Actions from "actions/world"
import { connect } from "react-redux"
import Mousetrap from "mousetrap"
import Setting from "setting"
import { STATUS } from "constants/strings"
import "./styles.css"

class Build extends Component {
  static propTypes = {
    /* Injected by Redux */
    status: PropTypes.string,
    responses: PropTypes.array,
    dispatch: PropTypes.func,
  }

  componentDidMount() {
    /* Bind Ctrl+Z and Crtl+Shift+Z to Undo and Redo actions respectively */
    Mousetrap.prototype.stopCallback = () => false;
    Mousetrap.bind("command+z", (e) => { e.preventDefault(); this.props.dispatch(Actions.undo()) })
    Mousetrap.bind("command+shift+z", (e) => { e.preventDefault(); this.props.dispatch(Actions.redo()) })
  }

  componentWillUnmount() {
    /* Clean up the key undo+redo bindings */
    Mousetrap.unbind("command+z")
    Mousetrap.unbind("command+shift+z")
  }

  handleQuery(query) {
    switch (this.props.status) {
      case STATUS.TRY:
        /* Try the query */
        this.props.dispatch(Actions.tryQuery(query))
        break
      case STATUS.ACCEPT:
        /* Otherwise, just accept normally */
        break
      case STATUS.LOADING:
        this.props.dispatch(Actions.setStatus(STATUS.TRY))
        break
      default:
        console.log("uh oh... unknown status!", this.props.status)
        break
    }
  }

  accept(spec) {
    this.props.dispatch(Actions.accept(this.props.query, spec))
  }

  getCurrentState() {
    const {history, current_history_idx } = this.props
    let idx = current_history_idx >= 0 ? current_history_idx : history.length - 1
    if (idx > history.length - 1) idx = history.length - 1
    return history[idx].value
  }

  render() {
    const {responses } = this.props

    /* The current state should be the history element at the last position, or
     * the one selected by the current_history_idx */
    let plots = responses.map(r =>
      (
        <Setting spec={r.value}/>
      )
    );
    return (
      <div className="Build">
        <div className="Build-world">
          {plots}
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  status: state.world.status,
  responses: state.world.responses,
  current_history_idx: state.world.current_history_idx
})

export default connect(mapStateToProps)(Build)
