import React from 'react'
import { connect } from "react-redux"
import Actions from "actions/world"
import Mousetrap from 'mousetrap'
// eslint-disable-next-line
import { Input, Icon, Segment } from 'semantic-ui-react'
import "./styles.css"

class CommandBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: props.query
    };
  }

  componentWillReceiveProps(nextProps) {
    if (this.state.value !== nextProps.query)
      this.setState({'value': nextProps.query})
  }

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
    this.setState({
      value: value
    });
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
    this.props.dispatch(Actions.tryQuery(this.props.query))
  }

  render() {
    return (
      <Input className="CommandBar" icon placeholder='type a command...'
        ref={(input) => { this.commandBar = input; }}
        onChange={(e, v) => this.onChange(e, v)}
        onKeyDown ={e => this.handleKeyDown(e)}
        autoFocus
        size="large"
        >
          <input/>
          <Icon name='search' link={true} onClick={e => this.handleClick(e)}/>
        </Input>
    );
  }
}

const mapStateToProps = (state) => ({
  query: state.world.query,
  isInitial: Object.keys(state.world.context).length === 0
})

export default connect(mapStateToProps)(CommandBar)
