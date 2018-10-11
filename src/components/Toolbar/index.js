import React from 'react';
import {connect} from 'react-redux';
import Actions from 'actions/world'
import { Dropdown, Icon, Checkbox, Segment, Button, Menu } from 'semantic-ui-react'
import config from 'config'
import {prettyStringify, editorURL} from 'helpers/vega-utils'
import {examplesList} from '../../helpers/vega-utils';

class Toolbar extends React.Component {
  toggleShowErrors() {
    this.props.dispatch(Actions.setState({showErrors: !this.props.showErrors}));
  }

  toggleShowFormulas() {
    this.props.dispatch(Actions.setState({showFormulas: !this.props.showFormulas}));
  }

  setExample(name) {
    const {dispatch} = this.props
    dispatch(Actions.labelInit(name))
  }

  render() {
    const exampleOptions = examplesList().map((ex, i) =>
        {return {key: ex.name, value: ex.name, text: ex.title}}
    );
    return (
      <Menu vertical>
        <Menu.Item>
          <Dropdown id="example-selector" placeholder='select a example' search selection fluid
            options={exampleOptions}
            onChange={(e, data) => this.setExample(data.value)}
          />
        </Menu.Item>
        <Menu.Item>
          <Checkbox
            label="Show all"
            onClick={() => {this.toggleShowFormulas()}}
          />
        </Menu.Item>
        <Menu.Item>
          <Button onClick={() => window.open(editorURL(prettyStringify(this.props.context)), '_blank')}>Open in Editor</Button>
        </Menu.Item>
      </Menu>
    )
  }
}

function mapStateToProps(state, ownProps) {
  return {
    showErrors: state.world.showErrors,
    showFormulas: state.world.showFormulas,
    numCandidates: state.world.responses.length,
    editorString: state.world.editorString,
    context: state.world.context,
    status: state.world.status,
  };
}

export default connect(mapStateToProps)(Toolbar);
