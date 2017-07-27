import React from 'react';
import {connect} from 'react-redux';
import Actions from 'actions/world'
import AceEditor from 'react-ace';
import classnames from 'classnames'
import 'brace/mode/json';
import 'brace/theme/github';
import './index.css'

function pretty(json) {
  return JSON.stringify(json, null, '\t')
}

class InputPanel extends React.Component {
  constructor(props) {
    super(props)
    this.state = { value:  pretty(props.spec)}
    this.onChange = this.onChange.bind(this);
  }

  onChange(newValue) {
    this.value = newValue;
    this.setState({
      value: newValue
    })
  }

  updateSpec() {
    this.props.dispatch(Actions.updateSpec(this.state.value));
  }

  clearAll() {
    this.props.dispatch(Actions.clear());
  }

  componentWillReceiveProps(nextProps) {
    console.log("componentWillReceiveProps");
    this.state = { value:  pretty(nextProps.spec)}
  }

  render() {
    return (
      <div>
        <div>
          <button className={classnames({active: true})} onClick={() => this.updateSpec()}>Parse</button>
          <button className={classnames({active: true})} onClick={() => this.clearAll()}>Clear</button>
        </div>
        <AceEditor
          mode="json"
          theme="github"
          value={this.state.value}
          name="spec-editor"
          onChange={this.onChange}
          style={{ width: '100%' }}
          editorProps={{$blockScrolling: true}}
        />
      </div>
    )
  }
}
export default connect()(InputPanel);
