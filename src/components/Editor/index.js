import React from "react"
import {connect} from "react-redux";
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
     <SplitPane split="horizontal" minSize={30} defaultSize={250}
        pane1Style={{display: 'flex', overflow: 'scroll'}} className='main-pane'>
       <div className="editor-chart"><VegaLite spec={this.props.context} key='current-plot' /></div>
       <SpecEditor key='spec-editor' spec={this.props.context}/>
     </SplitPane>
    )
  }
}

const mapStateToProps = (state) => ({
  context: state.world.context
})
export default connect(mapStateToProps)(Editor)
