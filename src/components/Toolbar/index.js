import React from 'react';
import {connect} from 'react-redux';
import Actions from 'actions/world'
import { Dropdown, Checkbox, Menu, Icon} from 'semantic-ui-react'
import {prettyStringify, editorURL, vegaliteKeywords} from 'helpers/vega-utils'
import {examplesList} from 'helpers/vega-utils';
import {initialState} from 'store/world'

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

  search(options, value) {
    const startsWithValue = options.filter(opt => opt.value.toLowerCase().startsWith(value.toLowerCase()))
    const containsValue = options.filter(opt => !opt.value.toLowerCase().startsWith(value.toLowerCase()))
      .filter(opt => opt.value.toLowerCase().includes(value.toLowerCase()))
    return startsWithValue.concat(containsValue);
  }

  setFilterType(value) {
    const {dispatch, filter} = this.props
    dispatch(Actions.setState({'filter': {...filter, 'type': value}}))
    dispatch(Actions.tryQuery())
  }

  clearFilter() {
    const {dispatch} = this.props
    dispatch(Actions.setState({'filter': initialState.filter}))
    dispatch(Actions.tryQuery())
  }

  render() {
    const {filter} = this.props
    return (
      <Menu vertical style={{minWidth: '300px'}}>

        <Menu.Item>
          <Menu.Header>Select an example</Menu.Header>
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
              <Dropdown placeholder='type of value' search fluid selection
                options={valueTypeOptions}
                value={filter.type}
                onChange={(e, d) => {this.setFilterType(d.value)}}
              />
            </Menu.Item>

            <Menu.Item>
              <Dropdown placeholder='vegalite keywords' fluid multiple selection clearable
                search={(opts, v) => this.search(opts, v)}
                options={keywordOptions}
                value={filter.keywords}
                onChange={(e, d) => {this.setFilterKeys(d.value)}}
              />
            </Menu.Item>

            <Menu.Item onClick={() => {this.clearFilter()} }>
              Clear filters
            </Menu.Item>
            <Menu.Item>
              <Checkbox toggle
                label="Show formulas and errors"
                onClick={() => {this.toggleShowErrors(); this.toggleShowFormulas()}}
              />
            </Menu.Item>
          </Menu.Menu>
        </Menu.Item>
        <Menu.Item onClick={() => window.open(editorURL(prettyStringify(this.props.context)), '_blank')}>
          Open in Editor...
        </Menu.Item>
        <Menu.Item onClick={() => window.open("https://github.com/stanfordnlp/plot-interface/blob/master/Help.md", '_blank')}>
          Help
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
