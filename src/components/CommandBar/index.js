import React, { Component, PropTypes } from "react"
import { connect } from "react-redux"
import classnames from "classnames"
import Actions from "actions/world"
import { STATUS } from "constants/strings"
import Autocomplete from './autocomplete.js'
import "./styles.css"

class CommandBar extends Component {
  static propTypes = {
    /* Callback function when the CommandBar button clicks clicked */
    onClick: PropTypes.func,

    /* injected by Redux */
    status: PropTypes.string,
    query: PropTypes.string,
    dispatch: PropTypes.func
  }

  handleClick() {
    /* If the query is empty, we don't want to do anything */
    if (this.props.query.length === 0) {
      return
    }
    /* Fire off the callback */
    this.props.onClick(this.props.query)
  }

  handleKeyDown(e) {
    if (e.keyCode === 13) {
      if (e.shiftKey) {
        /* If we hit Shift+Enter, we want to define the head */
        this.handleClick()
      } else {
        /* If we hit Enter, it is an alias to clicking the button */
        this.handleClick()
      }
    }
  }

  handleChange(newValue) {
    console.log(newValue)
    // const newValue = e.target.value
    if (newValue !== this.props.query) {
      this.props.dispatch(Actions.setQuery(newValue))
      this.props.dispatch(Actions.setStatus(STATUS.TRY))
    }
  }

  render() {
    const { query, status } = this.props

    return (
      <div className="CommandBar">
        <Autocomplete
        inputProps={{value: query, onChange:(e) => this.handleChange(e), onKeyDown: (e) => this.handleKeyDown(e)}}/>
        <button className={classnames({ "active": ((status === STATUS.TRY) && query.length > 0) })} onClick={() => this.handleClick()}>
          {status}
        </button>
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  query: state.world.query,
  status: state.world.status
})

export default connect(mapStateToProps)(CommandBar)
