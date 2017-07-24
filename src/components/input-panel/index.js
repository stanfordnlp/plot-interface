import React from 'react';
import SpecEditor from './spec-editor';
import {connect} from 'react-redux';
import './index.css'

class InputPanel extends React.Component {
  render() {
    return (
        <div className={'full-height-wrapper'}>
          <SpecEditor key='editor' />
        </div>
    )
  }
}
export default connect()(InputPanel);
