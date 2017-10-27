import React, { Component } from "react"
import JsonPatch from 'fast-json-patch'
import AceEditor from 'react-ace'
import "./styles.css"
class JsonPatchEditor extends Component {
  constructor(props) {
    super(props)
    let initialPatch = []
    if (props.initial!==undefined && props.context!==undefined) {
      initialPatch = JsonPatch.compare(props.context, this.props.initial)
    }

    const stringPatch = initialPatch.filter(p => p.value!==undefined)
      .map(p => {p.value = JSON.stringify(p.value); return p})
    this.state = {
      jsonPatch: stringPatch,
      context: props.context,
    }
  }

  jsonPatchEditValue(value, ind) {
    const jsonPatch = this.state.jsonPatch.map((p, i) => {
      if (i !== ind) return p
      p.value = value
      return p
    });
    this.setState({jsonPatch})
    let actualPatch
    try {
      actualPatch = jsonPatch.map(p => {
        if (p.value === undefined) return p
        const q = JSON.parse(JSON.stringify(p))
        q.value = JSON.parse(q.value);
        return q
      })
     } catch (ex) {
       console.log(ex)
       return
     }
     const deepCopy = JSON.parse(JSON.stringify(this.state.context))
     const after = JsonPatch.applyPatch(deepCopy, actualPatch).newDocument
     this.props.update(after)

  }

  render() {
    const diffUI = this.state.jsonPatch.map((p,ind) =>
      <div>
        {`${ind}) ${p.op} ${p.path}: `}
        <AceEditor
          name="spec-editor"
          mode="json"
          theme="github"
          height="20px"
          width="100%"
          maxLines={10}
          minLines={1}
          value={p.value}
          onChange={e => this.jsonPatchEditValue(e, ind)}
          editorProps={{$blockScrolling: true}}
        />
      </div>
    )
    return <div>{diffUI}</div>
  }
}
export default JsonPatchEditor
