import React from "react"
import {connect} from "react-redux";
import SpecEditor from "components/SpecEditor"
import DataModal from 'components/DataModal'
import CurrentDataTable from './CurrentDataTable'
import {parseWithErrors} from 'helpers/vega-utils'

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

  labelJSON() {
    try {
      const spec = JSON.parse(this.props.editorString)
      const {logger} = parseWithErrors(spec)
      if (logger.warns.length > 0 || logger.errors.length > 0) {
        window.alert('current spec has errors, cannot be labeled')
        console.log('validation errors', logger)
        return
      }
      this.props.onLabel(spec, '(no formula, you are labeling json..)')
    } catch (e) {
      window.alert('error in spec (see console)')
      console.error('spec error', e);
    }
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
