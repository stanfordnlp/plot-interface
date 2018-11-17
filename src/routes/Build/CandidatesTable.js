import React, {PureComponent} from 'react'
import PropTypes from 'prop-types';
import { connect } from "react-redux"
// eslint-disable-next-line
import { Label, Button, Table, Menu, Icon, Dropdown, Popup} from 'semantic-ui-react'
import PathEditor from "components/Plot/PathEditor"
import InspectModal from 'components/LabelModal/InspectModal'
import VegaLite from "components/Plot/VegaLite"

import "./styles.css"

class CandidatesList extends PureComponent {
  static propTypes = {
    /* Injected by Redux */
    responses: PropTypes.array,
    dispatch: PropTypes.func,
  }

  constructor(props) {
    super(props)
    this.state = {openIndex: -1}
  }

  render() {
    const {responses} = this.props
    const {openIndex} =  this.state

    return (
      <Table collapsing compact>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell></Table.HeaderCell>
            <Table.HeaderCell>Command</Table.HeaderCell>
            <Table.HeaderCell>VegaLite Action</Table.HeaderCell>
            <Table.HeaderCell>Probability %</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
        {
          responses.map((candidate,r) => {
            const patch = candidate.canonical_patch[0]
            const {xbests} = candidate
            const xbestsOptions = xbests.map((x, i) => {return {'value': x , 'text': x, 'key':i}})
            const randBest = xbestsOptions[0].value
            return (
              <Table.Row key={r}>
                <Table.Cell>
                  <Button.Group>
                  <Popup flowing position="bottom left"
                    trigger={<Button basic icon='unhide' />}
                    content={
                      <VegaLite spec={responses[r].value}/>
                    }
                  />
                  <Button basic icon='edit' onClick={()=>this.setState({openIndex: r})}/>
                  </Button.Group>
                </Table.Cell>
                {/* <Table.Cell>
                  {randBest}
                </Table.Cell> */}
                <Table.Cell>
                <Dropdown inline text={randBest}>
                 <Dropdown.Menu>
                   <Dropdown.Header content='Other descriptions' />
                   <Dropdown.Menu scrolling>
                     {xbestsOptions.map(option => <Dropdown.Item key={option.value} {...option} />)}
                   </Dropdown.Menu>
                 </Dropdown.Menu>
                </Dropdown>
                </Table.Cell>
                <Table.Cell>
                  <PathEditor value={patch.value} onChange={undefined} path={patch.path} schema={candidate.schema}/>
                </Table.Cell>
                <Table.Cell>
                  {candidate.score > 1e-4? (candidate.score*100).toFixed(2): '>1e' + Math.floor(Math.log10(candidate.score*100))}
                </Table.Cell>
              </Table.Row>
            )
          })
        }
      </Table.Body>
      {openIndex === -1? null :
        <InspectModal candidate={responses[openIndex]} onClose={() => this.setState({openIndex: -1})}/>}
    </Table>
    );
  }
}


const mapStateToProps = (state) => ({
  responses: state.world.responses,
  context: state.world.context,
  dataValues: state.world.dataValues,
  showFormulas: state.world.showFormulas,
})

export default connect(mapStateToProps)(CandidatesList)
