import React from 'react';
import {connect} from 'react-redux';
import Actions from 'actions/world'
import classnames from 'classnames'
import {parseWithErrors} from 'helpers/vega-utils'
import './index.css'
class Toolbar extends React.Component {
  // clearAll() {
  //   this.props.dispatch(Actions.clear());
  // }

  toggleShowErrors() {
    this.props.dispatch(Actions.setShowErrors(!this.props.showErrors));
  }

  toggleShowFormulas() {
    this.props.dispatch(Actions.setShowFormulas(!this.props.showFormulas));
  }

  updateSpec() {
    try {
      const spec = JSON.parse(this.props.editorString)
      const {logger} = parseWithErrors(spec)
      if (logger.warns.length > 0 || logger.errors.length > 0) {
        window.alert('current spec has errors, cannot be parsed')
        console.log('validation errors', logger)
        return
      }
      this.props.onLabel(spec, '(none)')
      // this.props.dispatch(Actions.updateSpec());
    } catch (e) {
      window.alert('error in spec (see console)')
      console.error('spec error', e);
    }
  }

  render() {
    return (
      <div className='Toolbar'>
        {/* <button>{this.props.status}</button> */}
        <button># candidates: {this.props.numCandidates}</button>
        {/* <button className={classnames({active: true})} onClick={() => this.updateSpec()}>Parse JSON Spec</button> */}
        {/* <button className={classnames({active: true})} onClick={() => this.toggleShowErrors()}>
          {this.props.showErrors? 'hide errors' : 'show errors'}
        </button> */}

        {/* <button className={classnames({active: true})} onClick={() => this.labelJSON()}>Label JSON Spec</button> */}
        <button className={classnames({active: true})} onClick={() => this.toggleShowFormulas()}>
          {this.props.showFormulas? 'hide errors' : 'show all'}
        </button>
      </div>
    )
  }
}

function mapStateToProps(state, ownProps) {
  return {
    showErrors: state.world.showErrors,
    showFormulas: state.world.showFormulas,
    numCandidates: state.world.responses.length,
    editorString: state.world.editorString,
    status: state.world.status,
  };
}
export default connect(mapStateToProps)(Toolbar);
