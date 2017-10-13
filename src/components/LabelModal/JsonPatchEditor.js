import React, { Component } from "react"
import JsonPatch from 'fast-json-patch'
import "./styles.css"
class JsonPatchEditor extends Component {
  constructor(props) {
    super(props)
    let initialPatch = []
    if (props.initial!==undefined && props.context!==undefined) {
      initialPatch = JsonPatch.compare(props.context, this.props.initial)
    }
    this.state = {
      jsonPatch: initialPatch,
      context: props.context,
    }
  }

  jsonPatchEditValue(e, ind) {
    const jsonPatch = this.state.jsonPatch.map((p, i) => {
      if (i !== ind) return p
      p.value = JSON.parse(e.target.value)
      return p
    });
    const after = JsonPatch.applyPatch(this.state.context, jsonPatch).newDocument
    this.props.update(after)
    this.setState({jsonPatch})
  }

  render() {
    const diffUI = this.state.jsonPatch.map((p,ind) =>
      <div>
        {`${ind}) ${p.op} ${p.path}: `}
          <input type="text" value={JSON.stringify(p.value)} onChange={e => this.jsonPatchEditValue(e, ind)}/>
      </div>
    )
    return <div>{diffUI}</div>
  }
}
export default JsonPatchEditor
