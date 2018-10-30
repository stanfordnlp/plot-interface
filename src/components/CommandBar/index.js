import React from 'react'
import { connect } from "react-redux"
import Actions from "actions/world"
import Mousetrap from 'mousetrap'
// eslint-disable-next-line
import { Input, Icon, Button, Label, Checkbox} from 'semantic-ui-react'
import "./styles.css"

const examplesUtts = [
  'y label font size 25',
  'put "something" as the plot title',
  'more horizontal grids',
  'move x label down by 50',
  'remove x axis ticks',
  'remove x label',
  'make grid darkblue',
]

class CommandBar extends React.Component {
  componentDidMount() {
    Mousetrap.prototype.stopCallback = () => false;
    // Mousetrap.bind("ctrl+m", (e) => { this.commandBar.focus() })
    // setTimeout(this.commandBar.focus(), 2000)
  }
  componentWillUnmount() {
    // Mousetrap.unbind("enter")
    Mousetrap.unbind("ctrl+m")
  }

  onChange = (event, {value}) => {
    this.props.dispatch(Actions.setQuery(value))
  };

  handleKeyDown(e) {
    if (e.keyCode === 13) {
      this.sendQuery()
    }
  }
  handleClick() {
    this.sendQuery()
  }

  sendQuery() {
    this.props.dispatch(Actions.tryQuery())
  }

  sendRandomQuery() {
    const randomCmd = examplesUtts[Math.floor(Math.random()*examplesUtts.length)];
    console.log(randomCmd)
    this.props.dispatch(Actions.setQuery(randomCmd))
    this.props.dispatch(Actions.tryQuery('rand_example'))
  }

  render() {
    return (
      <Input className="CommandBar" icon placeholder='type a command... e.g. label x as "test value"'
        ref={(input) => { this.commandBar = input; }}
        onChange={(e, v) => this.onChange(e, v)}
        value={this.props.query}
        onKeyDown ={e => this.handleKeyDown(e)}
        autoFocus
        size="large"
        action
      >
        <input/>
        <Button primary content='Enter'
          onClick={e => this.handleClick(e)} />
        <Button primary icon='question' content='Random'
          onClick={e => this.sendRandomQuery(e)} />
      </Input>
    )
  }
}

const mapStateToProps = (state) => ({
  query: state.world.query,
  isInitial: Object.keys(state.world.context).length === 0
})

export default connect(mapStateToProps)(CommandBar)
