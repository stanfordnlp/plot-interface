import React from "react"
import classnames from "classnames"
import Plot from "plot/Plot"

import "./styles.css"

class Target extends React.Component {
  static propTypes = {
    current: React.PropTypes.array,
  }

  constructor(props) {
    super(props)

    this.state = { collapsed: false }
  }

  render() {
    const { current } = this.props

    return (
      <div className={classnames("SidePanel Target", { "collapsed": this.state.collapsed })}>
        <div className="SidePanel-header">
          <span className="SidePanel-header-name">Target</span>
          <div onClick={() => this.setState({ collapsed: !this.state.collapsed })} className="Target-header-arrow">
            {(() => {
              if (this.state.collapsed) return (<span>&larr;</span>)
              return (<span>&rarr;</span>)
            })()}
          </div>
        </div>
        <div className="Target-struct">
          <Plot spec={current} width={660} height={480} />
        </div>
      </div>
    )
  }
}

export default Target
