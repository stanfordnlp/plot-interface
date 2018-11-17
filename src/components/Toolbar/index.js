import React from 'react';
import {connect} from 'react-redux';
import Actions from 'actions/world'
// eslint-disable-next-line
import { Dropdown, Checkbox, Menu, Icon, Label, Form} from 'semantic-ui-react'

import TeachingModal from 'components/LabelModal/EditorModal'
import {prettyStringify, editorURL, vegaliteKeywords} from 'helpers/vega-utils'
import {examplesList} from 'helpers/vega-utils';
import {initialState} from 'store/world'

import config from 'config'

const helpLink = "https://github.com/stanfordnlp/plot-interface/blob/master/Help.md#help"
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
  constructor(props) {
    super(props)
    this.state = {editModal: false, importModal: false}
  }

  toggleShowErrors() {
    this.props.dispatch(Actions.setState({showErrors: !this.props.showErrors}));
  }

  toggleShowFormulas(value) {
    this.props.dispatch(Actions.setState({showFormulas: value}));
  }

  setExample(name) {
    const {dispatch} = this.props
    dispatch(Actions.initContext(name))
  }

  setFilterKeys(value) {
    const {dispatch, filter} = this.props
    dispatch(Actions.setState({'filter': {...filter, 'keywords': value}}))
    dispatch(Actions.tryQuery("filter"))
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
    dispatch(Actions.tryQuery("filter"))
  }

  clearFilter() {
    const {dispatch} = this.props
    dispatch(Actions.setState({'filter': initialState.filter}))
    dispatch(Actions.tryQuery("filter_clear"))
  }

  render() {
    const {filter, context} = this.props
    let filterEmpty = false
    if (filter.type === 'any' && filter.keywords.length === 0) {
      filterEmpty = true
    }
    console.log(filter, filterEmpty)

    return (
      <Menu vertical style={{minWidth: '300px', 'marginTop': '1em'}}>
        <Menu.Item>
          <Menu.Header>Select an example</Menu.Header>
          <Dropdown id="example-selector" placeholder='select an example' search selection fluid
            options={exampleOptions}
            onChange={(e, data) => this.setExample(data.value)}
            defaultValue={config.initialExample}
          />
        </Menu.Item>


        <Menu.Item onClick={() => this.setState({importModal: true})}>
          Import spec
        </Menu.Item>
        {this.state.importModal?
          <TeachingModal header={"Import spec"} spec={{"paste your spec here": "!"}} context={{}}
            onClose={() => {
              this.setState({importModal: false})
            }}/>: null}

        <Menu.Item onClick={() => this.setState({editModal: true})}>
          Edit current spec
        </Menu.Item>

        {this.state.editModal?
          <TeachingModal header={"Edit spec"}  spec={context} context={context} onClose={() => this.setState({editModal: false})}/>: null}


        <Menu.Item onClick={() => window.open(editorURL(prettyStringify(this.props.context)), '_blank')}>
          Open in Vega editor...
        </Menu.Item>
        {/* <Menu.Item onClick={() => {}}>
          Render more
        </Menu.Item> */}
        <Menu.Item>
          <Menu.Header>
            Filters
          </Menu.Header>
          <Label color={filterEmpty? undefined : "red"}>{filterEmpty? " no filters used" : "using filters!"}</Label>
          <Menu.Menu>
            <Menu.Item onClick={() => {this.clearFilter()} }>
              Clear filters
            </Menu.Item>
            <Menu.Item>
              <Form size="small">
              <Form.Dropdown placeholder='vegalite keywords' fluid multiple selection clearable
                label="Contains keywords"
                search={(opts, v) => this.search(opts, v)}
                options={keywordOptions}
                value={filter.keywords}
                onChange={(e, d) => {this.setFilterKeys(d.value)}}
              />
              {/* <Form.Dropdown
                label="Type of value"
                search selection
                options={valueTypeOptions}
                value={filter.type}
                onChange={(e, d) => {this.setFilterType(d.value)}}
              /> */}
              <Form.Field>
                <Checkbox
                  slider
                  label='Show list'
                  name='checkboxRadioGroup'
                  value='this'
                  checked={this.props.showFormulas}
                  onChange={() => this.toggleShowFormulas(true)}
                />
              </Form.Field>
              <Form.Field>
                <Checkbox
                  slider
                  label='Show graphics'
                  name='checkboxRadioGroup'
                  value='that'
                  checked={!this.props.showFormulas}
                  onChange={() => this.toggleShowFormulas(false)}
                />
              </Form.Field>
              </Form>

            </Menu.Item>
          </Menu.Menu>
        </Menu.Item>
        <Menu.Item onClick={() => window.open(helpLink, '_blank')}>
          <Icon name='help' />
          Help
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
    filter: state.world.filter,
    context: state.world.context,
    status: state.world.status,
  };
}

export default connect(mapStateToProps)(Toolbar);
