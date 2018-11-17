import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import Actions from 'actions/world'
import hash from 'string-hash'
import InnerChart from './InnerChart'
// eslint-disable-next-line
import { Button, Label, Header, Popup, Dropdown} from 'semantic-ui-react'
import TeachingModal from 'components/LabelModal/TeachingModal'
import InspectModal from 'components/LabelModal/InspectModal'
import PathEditor from "components/Plot/PathEditor"

import './candidate.css'

class Plot extends React.PureComponent {
  static propTypes = {
    candidate: PropTypes.object,
    dataURL: PropTypes.string,
    logger: PropTypes.object,
    showTools: PropTypes.bool,
    onLabel: PropTypes.func,
  }

  constructor(props) {
    super(props)
    const {logger} = this.props;
    const hasError = logger.warns.length > 0 || logger.errors.length > 0;
    this.config = { showTools: true, iconSize: 20}
    this.state = { isClosed: false, inspectModal: false, teachModal: false, hasError, ...props}
  }

  accept() {
    const {value, formula} = this.props.candidate
    this.props.dispatch(Actions.accept(value, formula, 'Candidate.accept'));
  }

  remove() {
    const {value, formula} = this.props.candidate
    const {issuedQuery} = this.props
    // label: (utterance, spec, formula, type='label')
    this.props.dispatch(Actions.label(issuedQuery, value, formula, 'reject'));
    this.setState({isClosed: true})
  }

  onLabel() {
    this.setState({inspectModal: true})
  }

  onTeach() {
    this.setState({teachModal: true})
  }

  onClick(e) {
    console.log('plotHash', hash(this.state.dataURL))
    // let newWindow = window.open(this.state.dataURL, '')
    // const img = new Image()
    // img.src = this.state.dataURL
    // newWindow.document.write(img.outerHTML)
  }

  renderChart() {
    const equalMsg = this.state.isEqual? <li className='display-errors' key={'equalmsg'}>no change</li>: null
    const errors = this.state.logger.errors.map((v, i) => <li className='display-errors' key={'error'+i}>{v}</li>)
    const warns = this.state.logger.warns.map((v, i) => <li className='display-warns' key={'warn'+i}>{v}</li>)
    const {candidate} = this.props
    const patch = candidate.canonical_patch[0]
    const {xbests} = candidate
    const xbestsOptions = xbests.map((x, i) => {return {'value': x , 'text': x, 'key':i}})
    // const randBest = xbestsOptions[Math.floor(Math.random()*xbestsOptions.length)].value
    const randBest = xbestsOptions[0].value
    return (
      <div className='chart-container'>
        <Button.Group primary>
           <Button icon='edit' content='Refine' onClick={() => this.onLabel()} />
           {/* <Button icon='comment' content='Teach' onClick={() => this.onTeach()} /> */}
           <Button icon='check' content='Use' onClick={(e) => this.accept()} />
           {/* <Button icon='close' onClick={(e) => this.remove()} /> */}
        </Button.Group>
        <div>
          <PathEditor value={patch.value} onChange={undefined} path={patch.path} schema={candidate.schema}/>
        </div>
        <div>
          <Dropdown inline text={randBest}>
           <Dropdown.Menu>
             <Dropdown.Header content='Other commands'/>
             <Dropdown.Menu scrolling >
               {xbestsOptions.map(option => <Dropdown.Item key={option.value} disabled="true" {...option} />)}
             </Dropdown.Menu>
           </Dropdown.Menu>
          </Dropdown>
        </div>

        <div>
          <div className='chart'
            // onClick={e => this.onLabel(e)}
          >
            <InnerChart dataURL={this.state.dataURL}/>
          </div>
          <div>
            <ul> {[equalMsg, ...errors.concat(warns)]} </ul>
          </div>
        </div>
        {/* <div>
          <Label>{this.props.header}</Label>
        </div> */}
        {this.state.inspectModal?
          <InspectModal candidate={candidate} onClose={() => this.setState({inspectModal: false})}/>: null}
        {this.state.teachModal?
          <TeachingModal candidate={candidate} onClose={() => this.setState({teachModal: false})}/>: null}
      </div>
    )

  }
  render() {
    if (!this.props.showErrors && this.state.hasError)
      return null;
    if (this.state.isClosed)
      return null;
    return (
      this.renderChart()
    )
  }
}

const mapStateToProps = (state) => ({
  // context: state.world.context,
  responses: state.world.responses,
  showErrors: state.world.showErrors,
  issuedQuery: state.world.issuedQuery,
})
export default connect(mapStateToProps)(Plot);
