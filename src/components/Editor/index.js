import React from "react"
import {connect} from "react-redux";
import classnames from "classnames"
import VegaLite from "plot/VegaLite"
import Plot from "plot/Plot"

import "./styles.css"

class Editor extends React.Component {
  static propTypes = {
    history: React.PropTypes.array,
    current_history_idx: React.PropTypes.number,
  }

  constructor(props) {
    super(props)
    this.state = { collapsed: false }
  }

  getCurrentState() {
    const {history, current_history_idx } = this.props
    let idx = current_history_idx >= 0 ? current_history_idx : history.length - 1
    if (idx > history.length - 1) idx = history.length - 1
    console.log(current_history_idx);
    console.log(history[idx]);
    return history[idx].value
  }

  render() {
    return (
      <div className={classnames("SidePanel Target", { "collapsed": this.state.collapsed })}>
        <div className="SidePanel-header">
          <span className="SidePanel-header-name">Editor</span>
          <div onClick={() => this.setState({ collapsed: !this.state.collapsed })} className="Target-header-arrow">
            {(() => {
              if (this.state.collapsed) return (<span>&larr;</span>)
              return (<span>&rarr;</span>)
            })()}
          </div>
        </div>
        <div className="Target-struct">
          <Plot spec={this.getCurrentState()} showTools={false}/>
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  history: state.world.history,
  current_history_idx: state.world.current_history_idx
})
export default connect(mapStateToProps)(Editor)
