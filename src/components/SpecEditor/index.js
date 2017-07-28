import React from 'react';
import {connect} from 'react-redux';
import Actions from 'actions/world'
import AceEditor from 'react-ace';
import Toolbar from 'components/Toolbar'
import 'brace/mode/json';
import 'brace/theme/github';
import './index.css'

class InputPanel extends React.Component {
  onChange(newValue) {
    this.props.dispatch(Actions.setEditorString(newValue))
  }

  render() {
    return (
      <div>
        <Toolbar />
        <AceEditor
          mode="json"
          theme="github"
          value={this.props.editorString}
          name="spec-editor"
          onChange={v => this.onChange(v)}
          style={{ width: '100%' }}
          editorProps={{$blockScrolling: true}}
        />
      </div>
    )
  }
}

function mapStateToProps(state, ownProps) {
  return {
    editorString: state.world.editorString,
  };
}
export default connect(mapStateToProps)(InputPanel);
