import React, {PureComponent} from 'react'
import PropTypes from 'prop-types';
import { connect } from "react-redux"
import { Card, Dropdown, Icon, Header} from 'semantic-ui-react'

import Toolbar from 'components/Toolbar'
import InspectModal from 'components/LabelModal/InspectModal'
import CurrentDataTable from 'components/DataTable/CurrentDataTable'
import Candidates from './candidates.js'
import VegaLite from "components/Plot/VegaLite"

import Actions from "actions/world"
import {examplesList} from '../../helpers/vega-utils';

import "./styles.css"

class Build extends PureComponent {
  static propTypes = {
    /* Injected by Redux */
    context: PropTypes.object,
    candidate: PropTypes.func,
    dispatch: PropTypes.func,
  }

  componentDidMount() {
    /* Set the appropriate sessionId (either turker id or generated) */
    // const {dispatch} = this.props
    // const name = getParameterByName('example')
    // dispatch(Actions.labelInit(name))
    this.setExample('bar', 'Simple Bar Chart')
  }

  onLabel = (candidate) => {
    this.labelModal.onLabel(candidate)
  };

  setExample(name) {
    const {dispatch} = this.props
    dispatch(Actions.labelInit(name))
  }

  render() {
    const exampleOptions = examplesList().map((ex, i) =>
        {return {key: ex.name, value: ex.name, text: ex.title}}
    );
    return (
      <div style={{position: 'relative', height: `calc(100vh - ${50}px)`}}>
        <div className='Candidates'>
          <div className="chart-container">
            <Card.Content>
              <Header size='medium'>Current Example</Header>
              <Dropdown id="example-selector" placeholder='select a example' fluid search selection
                options={exampleOptions}
                onChange={(e, data) => this.setExample(data.value)}
              />
            </Card.Content>
            <Card.Content>
            {
              this.props.isInitial?
              'no current plot'
              :
              <VegaLite
                spec={this.props.context}
                dataValues={this.props.dataValues}
              />
            }
            </Card.Content>
          </div>
          <Candidates onLabel={this.onLabel} candidate={this.props.candidate}/>
        </div>
        {/* <InspectModal onRef={ref => (this.labelModal = ref)}/> */}
        <Toolbar onLabel={this.onLabel}/>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  isInitial: Object.keys(state.world.context).length === 0,
  context: state.world.context,
  dataValues: state.world.dataValues,
  count: state.user.count,
})
export default connect(mapStateToProps)(Build)
