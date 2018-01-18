import React from "react"
import {connect} from "react-redux";
import Actions from 'actions/world'
import DataModal from 'components/DataModal'
import CurrentDataTable from 'components/DataTable/CurrentDataTable'
import {parseWithErrors} from 'helpers/vega-utils'
import PropTypes from 'prop-types';
import {MdCheck} from 'react-icons/lib/md'
import VegaLite from "components/Plot/VegaLite"
import "./styles.css"

class Editor extends React.Component {
  static propTypes = {
    context: PropTypes.object,
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

  clearAll() {
    this.props.dispatch(Actions.clear());
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
          <CurrentDataTable/>
          <button className="active" onClick={() => this.openDataModal()}>Import Data</button>
          <button className="active" onClick={() => this.props.onLabel(this.props.context, '')}>Edit</button>
          <button className="active" onClick={() => this.clearAll()}>Reset</button>
          <DataModal isOpen={this.state.isOpen} onRequestClose={() => this.closeDataModal()}/>
        </div>
          <div className='chart-container' key='current'>
            {
              this.props.isInitial?
              <div>No current plot: click <MdCheck className='md-button' size={20}/> on the right panel to select one,
              or type a command to get other candidates. </div>
              :
              <VegaLite
                spec={this.props.context}
                dataValues={this.props.dataValues}
              />
            }
          </div>
        <ul>{messages}</ul>
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  context: state.world.context,
  editorString: state.world.editorString,
  dataValues: state.world.dataValues,
  isInitial: Object.keys(state.world.context).length === 0
})
export default connect(mapStateToProps)(Editor)
