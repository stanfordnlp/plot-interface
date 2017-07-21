import {connect} from 'react-redux';
import Renderer from './renderer';

function mapStateToProps(state, ownProps) {
  return {
    vegaSpec: state.vegaSpec,
    renderer: state.renderer,
    mode: state.mode,
    errorPane: state.errorPane,
    warningsLogger: state.warningsLogger,
    error: state.error,
    tooltip: state.tooltip
  };
}

const mapDispatchToProps = function(dispatch) {
  return {
    logError: (err) => {
      dispatch();
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Renderer);
