import React from "react"
import {connect} from "react-redux";
import SpecEditor from "components/SpecEditor"
import DataModal from 'components/DataModal'
import CurrentDataTable from './CurrentDataTable'
import "./styles.css"

class Editor extends React.Component {
  static propTypes = {
    context: React.PropTypes.object,
  }
  constructor(props) {
    super(props)
    this.state = {
      isOpen: props.false,
    };
  }

  openDataModal() {
    this.setState({isOpen: true})
  }
  closeDataModal() {
    this.setState({isOpen: false})
  }


  render() {
    return (
      <div className='editor-container'>
        <div>
          <CurrentDataTable/>
          <button className="active" onClick={() => this.openDataModal()}>select data</button>
          <DataModal isOpen={this.state.isOpen} onRequestClose={() => this.closeDataModal()}/>
        </div>
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
