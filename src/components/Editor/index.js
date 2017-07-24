import React from "react"
import {connect} from "react-redux";
import classnames from "classnames"
import SpecEditor from "components/input-panel"
import Plot from "plot/Plot"

import "./styles.css"

class Editor extends React.Component {
  static propTypes = {
    context: React.PropTypes.object,
  }

  constructor(props) {
    super(props)
    this.state = { collapsed: false }
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
          <Plot spec={this.props.context} showTools={false}/>
        </div>
        <div className="Target-struct">
          <SpecEditor/>
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  context: state.world.context
})
export default connect(mapStateToProps)(Editor)
