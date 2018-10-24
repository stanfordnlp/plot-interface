import React from 'react';
import {connect} from 'react-redux';
import Actions from 'actions/world'
import { Dropdown, Checkbox, Menu, Button} from 'semantic-ui-react'
import {prettyStringify, editorURL, vegaliteKeywords} from 'helpers/vega-utils'
import {examplesList} from '../../helpers/vega-utils';

const valueTypeOptions = ['any', 'number', 'string', 'boolean', 'null', 'array', 'object'].map((v) =>
    {return {key: v, value: v, text: v}}
);
const exampleOptions = examplesList().map((ex, i) =>
    {return {key: ex.name, value: ex.name, text: ex.title}}
);
const keywordOptions = vegaliteKeywords.map((v) =>
    {return {key: v, value: v, text: v}}
);

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

  setFilterKeys(value) {
    const {dispatch, filter} = this.props
    dispatch(Actions.setState({'filter': {...filter, 'keywords': value}}))
    dispatch(Actions.tryQuery())
  }

  setFilterType(value) {
    const {dispatch, filter} = this.props
    dispatch(Actions.setState({'filter': {...filter, 'type': value}}))
    dispatch(Actions.tryQuery())
  }

  applyFilter() {
    const {dispatch} = this.props
    dispatch(Actions.tryQuery())
  }

  render() {
    const {filter} = this.props
    return (
      <Menu vertical style={{minWidth: '400px'}}>
        <Menu.Item>
          <Dropdown id="example-selector" placeholder='select an example' search selection fluid
            options={exampleOptions}
            onChange={(e, data) => this.setExample(data.value)}
          />
        </Menu.Item>
        <Menu.Item>
          <Menu.Header>
            Filters
          </Menu.Header>
          <Menu.Menu>
            <Menu.Item>
              <Dropdown placeholder='type of value' fluid search selection
                options={valueTypeOptions}
                value={filter.type}
                onChange={(e, d) => {this.setFilterType(d.value)}}
              />
            </Menu.Item>

            <Menu.Item>
              <Dropdown placeholder='vegalite keywords' fluid multiple search selection
                options={keywordOptions}
                value={filter.keywords}
                onChange={(e, d) => {this.setFilterKeys(d.value)}}
              />
            </Menu.Item>

            {/* <Menu.Item>
              <Button onClick={() => this.applyFilter() }>Apply filter</Button>
            </Menu.Item> */}
            <Menu.Item>
              <Checkbox toggle
                label="Show all"
                onClick={() => {this.toggleShowErrors(); this.toggleShowFormulas()}}
              />
            </Menu.Item>
          </Menu.Menu>
        </Menu.Item>
        <Menu.Item>
          <Button onClick={() => window.open(editorURL(prettyStringify(this.props.context)), '_blank')}>Open in Editor</Button>
        </Menu.Item>

        {/* <Menu.Item onClick={() => {}}>
          Render more
        </Menu.Item> */}
      </Menu>
    )
  }
}

function mapStateToProps(state, ownProps) {
  return {
    showErrors: state.world.showErrors,
    showFormulas: state.world.showFormulas,
    numCandidates: state.world.responses.length,
    filter: state.world.filter,
    context: state.world.context,
    status: state.world.status,
  };
}

export default connect(mapStateToProps)(Toolbar);
