import React from 'react'
import { connect } from "react-redux"
import Actions from "actions/world"
import Mousetrap from 'mousetrap'
// eslint-disable-next-line
import { Input, Icon, Button, Label} from 'semantic-ui-react'
import "./styles.css"

class CommandBar extends React.Component {
  componentDidMount() {
    Mousetrap.prototype.stopCallback = () => false;
    Mousetrap.bind("ctrl+m", (e) => { this.commandBar.focus() })
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
    this.commandBar.focus()
    this.sendQuery()
  }

  sendQuery() {
    this.props.dispatch(Actions.tryQuery())
  }

  render() {
    return (
      <Input className="CommandBar" icon placeholder='type a command... e.g. move y axis left'
        ref={(input) => { this.commandBar = input; }}
        onChange={(e, v) => this.onChange(e, v)}
        value={this.props.query}
        onKeyDown ={e => this.handleKeyDown(e)}
        autoFocus
        size="large"
        action
        inverted
      >
        <input/>
        {/*<Label><Icon name='terminal' link={true} onClick={e => this.handleClick(e)}/></Label>*/}
        <Button primary content='Enter' onClick={e => this.handleClick(e)} />
      </Input>
    )
  }
}

const mapStateToProps = (state) => ({
  query: state.world.query,
  isInitial: Object.keys(state.world.context).length === 0
})

export default connect(mapStateToProps)(CommandBar)
