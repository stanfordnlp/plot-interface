import React from 'react';
import {connect} from 'react-redux';
import Actions from 'actions/world'
import AceEditor from 'react-ace';
import 'brace/mode/json';
import 'brace/theme/github';
import './index.css'

class InputPanel extends React.Component {
  onChange(newValue) {
    this.props.dispatch(Actions.setEditorString(newValue))
  }
    
  render() {
    return (
      <div className='absolute-wrapper'>
        <AceEditor
          name="spec-editor"
          mode="json"
          theme="github"
          height="100%"
          width="100%"
          maxLines = "Infinity"
          autoScrollEditorIntoView="true"
          value={this.props.editorString}
          onChange={v => this.onChange(v)}
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
