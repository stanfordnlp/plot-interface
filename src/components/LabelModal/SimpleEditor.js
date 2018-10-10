import React, { PureComponent } from "react"
// import JsonPatch from 'fast-json-patch'
import AceEditor from 'react-ace'
import {prettyStringify} from 'helpers/vega-utils'
// import * as ace from 'brace'
// var Range = ace.acequire('ace/range').Range
import "./styles.css"
import 'brace/mode/json';
import 'brace/theme/github';

class DiffEditor extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      specString : prettyStringify(props.initial),
      context: props.context,
    }
  }
  render() {
    return (
      <AceEditor
        ref="aceEditor"
        mode="json"
        theme="github"
        width="100%"
        value={this.props.value}
        readOnly={true}
      />
    )
  }
}
export default DiffEditor
