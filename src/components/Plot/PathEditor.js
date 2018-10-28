import React, { Component } from "react"
import PropTypes from 'prop-types';
import { Input, Popup, Label} from 'semantic-ui-react'
import Markdown from 'react-markdown';

// const inputProps = (schema) => {
//   const {type} = schema
//   console.log(schema)
//   if (type === 'number') {
//     const props = {type: 'number', step: 0.5}
//     const {minimum, maximum} = schema
//     if (minimum !== undefined)
//       props.min = minimum
//     if (maximum !== undefined)
//       props.max = maximum
//     if (minimum!== undefined && maximum!== undefined)
//       props.step = (maximum - minimum) / 10
//     return props
//   } else {
//     return {type: 'text', disabled: true}
//   }
// }


class PathEditor extends Component {
  static propTypes = {
    onChange: PropTypes.func.isRequired,
  }

  render() {
    const {schema, path, value} = this.props
    return (
      <Input
        value={String(value)}
        onChange={(e, d) => this.props.onChange(e, d)}
        label

      >
          <Popup
            trigger={<Label> {path} </Label>}
            content={
              <Markdown source={schema.description} />
            }
            size="large"
            flowing
        />
        <input disabled={this.props.onChange === undefined}/>
      </Input>
    )
  }
}


export default PathEditor
