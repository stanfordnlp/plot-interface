import React from "react"
import {connect} from "react-redux";
import SpecEditor from "components/SpecEditor"
//import VegaLite from "plot/VegaLite"
import DataTable from 'components/DataTable'

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
      <div className='editor-container'>
        <DataTable/>
        <div className='relative-container'>
          <div className='absoluate-container'>
            <SpecEditor key='spec-editor' spec={this.props.editorString}/>
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  context: state.world.context
})
export default connect(mapStateToProps)(Editor)
