import React from 'react'
import { connect } from "react-redux"
import Actions from "actions/world"
import Autosuggest from 'react-autosuggest'
import {VEGALITE_ENUMS} from './VegaConstants/vegalite-enums'
import {VEGALITE_PATHS} from './VegaConstants/vegalite-paths'
import {MdSearch} from 'react-icons/lib/md'

import "./styles.css"
import './autocomplete.css'
const suggestionLexicon = VEGALITE_ENUMS.concat(VEGALITE_PATHS)


class CommandBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      suggestions: [],
      value: props.query
    };
  }

  componentWillReceiveProps(nextProps) {
    if (this.state.value !== nextProps.query)
      this.setState({'value': nextProps.query})
  }

  onChange = (event, { newValue, method }) => {
    this.setState({
      value: newValue
    });
    this.props.dispatch(Actions.setQuery(newValue))
  };

  // https://developer.mozilla.org/en/docs/Web/JavaScript/Guide/Regular_Expressions#Using_Special_Characters
  // const escapeRegexCharacters = str => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  getSuggestions(value) {
    let tokens = value.split(" ")
    const lastToken = tokens.pop().trim()
    //const partial = escapeRegexCharacters(lastToken.trim());
    if (lastToken === '') {
      return [];
    }
    const prefix = lastToken.length < 2? new RegExp('^' + lastToken, 'i') : new RegExp(lastToken, 'i');
    return suggestionLexicon.filter(name => prefix.test(name)).map(last => tokens.join(' ') + ' ' + last);
  }

  onSuggestionsFetchRequested = ({ value }) => {
    this.setState({
      suggestions: this.getSuggestions(value)
    });
  };

  onSuggestionsClearRequested = () => {
    this.setState({
      suggestions: []
    });
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
    this.props.dispatch(Actions.tryQuery(this.props.query))
  }

  render() {
    const { suggestions } = this.state;
    const inputProps = {
       autoFocus: true,
       value: this.state.value,
       placeholder: "type command to modify plot",
       onChange: this.onChange,
       onKeyDown: e => this.handleKeyDown(e)
    };
    return (
      <div className="CommandBar">
        <Autosuggest
          suggestions={suggestions}
          onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
          onSuggestionsClearRequested={this.onSuggestionsClearRequested}
          getSuggestionValue={v => v}
          renderSuggestion={v => v}
          inputProps={inputProps}
        />
        <MdSearch className='md-button' size={30}
          onClick={(e) => {this.handleClick()}}
        />
      </div>

    );
  }
}

const mapStateToProps = (state) => ({
  query: state.world.query,
  isInitial: Object.keys(state.world.context).length === 0
})

export default connect(mapStateToProps)(CommandBar)
