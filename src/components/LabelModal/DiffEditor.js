import React, { Component } from "react"
import JsonPatch from 'fast-json-patch'
import AceEditor from 'react-ace'
import {prettyStringify} from 'helpers/vega-utils'
import JsonDiffMode from './JsonDiffMode.js'
import * as ace from 'brace'
import "./styles.css"
import 'brace/mode/javascript';


class DiffEditor extends Component {
  constructor(props) {
    super(props)
    this.state = {
      specString : prettyStringify(props.initial),
      context: props.context,
    }
  }

  onChange(value) {
    this.setState({'specString':value})
    try {
      const after = JSON.parse(value)
      this.props.update(after)
    } catch (ex) {}
  }

  componentDidMount() {
    //this.refs.aceEditor.editor.setMode("ace/mode/text");
    const editor = this.refs.aceEditor.editor
    // this.refs.aceEditor.editor.setReadOnly('false')
    editor.getSession().setMode(new JsonDiffMode());
    editor.getSession().foldAll(0,100)
    // editor.getSession().addGutterDecoration(2, 'test-gutter')
    var Range = ace.acequire('ace/range').Range
    editor.getSession().addMarker(new Range(0,3,2,6), 'changed-lines', 'fullLine', false)
  }

  render() {
    return (
      <div className='diffEditor'>
        <div>Edit properties below, the changes are highlighted</div>
        <div>
          <AceEditor
            ref="aceEditor"
            mode="text"
            theme="github"
            height="20px"
            width="100%"
            maxLines={30}
            minLines={1}
            value={this.state.specString}
            onChange={e => this.onChange(e)}
            editorProps={{$blockScrolling: true}}
          />
        </div>
      </div>
    )
  }
}
export default DiffEditor
