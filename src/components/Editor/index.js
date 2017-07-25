import React from "react"
import {connect} from "react-redux";
import classnames from "classnames"
import SpecEditor from "components/SpecEditor"
import VegaLite from "plot/VegaLite"
import SplitPane from 'react-split-pane';
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
        <div style={{position: 'relative', height: `calc(100vh - ${100}px)`}}>
         <SplitPane split="horizontal" minSize={300} maxSize={`calc(100vh - ${100}px)`} defaultSize={300} pane1Style={{display: 'flex'}} className='main-pane'>
           <div className="editor-chart"><VegaLite spec={this.props.context} key='current-plot' /></div>
           <SpecEditor key='spec-editor' spec={this.props.context}/>
         </SplitPane>
       </div>

      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  context: state.world.context
})
export default connect(mapStateToProps)(Editor)
