import {connect} from 'react-redux';
import Renderer from './renderer';
import Actions from '../../../actions/world';

const mapStateToProps = function(state, ownProps) {
  return {
    value: state.editorString,
    parsed: state.parse,
    autoParse: true,
  };
};

const mapDispatchToProps = function(dispatch) {
  return {
    updateVegaLiteSpec: (val) => {
      dispatch(Actions.updateVegaLiteSpec(val));
    },

    parseSpec: (val) => {
      dispatch(Actions.parseSpec(val));
    },

    updateEditorString: (val) => {
      dispatch(Actions.updateEditorString(val));
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Renderer);
