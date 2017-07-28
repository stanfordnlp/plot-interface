import React from 'react';
import {connect} from 'react-redux';
import Actions from 'actions/world'
import classnames from 'classnames'
import './index.css'
class Toolbar extends React.Component {
  clearAll() {
    this.props.dispatch(Actions.clear());
  }

  toggleShowErrors() {
    this.props.dispatch(Actions.setShowErrors(!this.props.showErrors));
  }

  toggleShowFormulas() {
    this.props.dispatch(Actions.setShowFormulas(!this.props.showFormulas));
  }

  updateSpec() {
    this.props.dispatch(Actions.updateSpec());
  }

  render() {
    return (
      <div className='Toolbar'>
        <button className={classnames({active: true})} onClick={() => this.updateSpec()}>Parse</button>
        <button className={classnames({active: true})} onClick={() => this.clearAll()}>Reset</button>
        <button className={classnames({active: true})} onClick={() => this.toggleShowErrors()}>
          {this.props.showErrors? 'hide errors' : 'show errors'}
        </button>
        <button className={classnames({active: true})} onClick={() => this.toggleShowFormulas()}>
          {this.props.showFormulas? 'hide formulas' : 'show formulas'}
        </button>
      </div>
    )
  }
}

function mapStateToProps(state, ownProps) {
  return {
    showErrors: state.world.showErrors,
    showFormulas: state.world.showFormulas
  };
}
export default connect(mapStateToProps)(Toolbar);
