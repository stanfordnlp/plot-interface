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
        this.setState({logger})
        return
      }
      this.props.onLabel(spec, '(no formula, you are labeling json..)')
    } catch (e) {
      const logger = {errors: [e.message], warns:[]}
      this.setState({logger})
    }
  }

  render() {
    let messages = null
    if (this.state.logger !== undefined) {
      const errors = this.state.logger.errors.map((v, i) => <li className='editor-display-errors' key={'error'+i}>{v}</li>)
      const warns = this.state.logger.warns.map((v, i) => <li className='display-warns' key={'warn'+i}>{v}</li>)
      messages = errors.concat(warns)
    }
    return (
      <div className='editor-container'>
        <div>
          <button className="active" onClick={() => this.openDataModal()}>select data</button>
          <button className="active" onClick={() => this.labelJSON()}>update spec</button>

          <CurrentDataTable/>
          <DataModal isOpen={this.state.isOpen} onRequestClose={() => this.closeDataModal()}/>
        </div>
        <div className='relative-container'>
          <div className='absoluate-container'>
            <SpecEditor key='spec-editor' spec={this.props.editorString}/>
          </div>
        </div>
        <div>
          <ul>{messages}</ul>
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  context: state.world.context,
  editorString: state.world.editorString,
})
export default connect(mapStateToProps)(Editor)
