import React from 'react';
import {connect} from 'react-redux';
import AceEditor from 'react-ace';
import 'brace/mode/json';
import 'brace/theme/github';

import './index.css'

class InputPanel extends React.Component {
  render() {
    return (
      <AceEditor
        mode="json"
        theme="github"
        value={JSON.stringify(this.props.spec, null, '\t')}
        name="spec-editor"
        style={{ width: '100%' }}
        editorProps={{$blockScrolling: true}}
      />
    )
  }
}
export default connect()(InputPanel);
