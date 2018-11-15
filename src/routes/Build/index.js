import React, {PureComponent} from 'react'
import PropTypes from 'prop-types';
import { connect } from "react-redux"

// eslint-disable-next-line
import { Icon, Header, Container} from 'semantic-ui-react'

import Candidates from './candidates.js'
import VegaLite from "components/Plot/VegaLite"
import Toolbar from "components/Toolbar"
import CandidatesTable from './CandidatesTable'

import Actions from "actions/world"
import config from 'config'
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
    this.setExample(config.initialExample)
  }

  setExample(name) {
    const {dispatch} = this.props
    dispatch(Actions.initContext(name))
  }

  render() {
    const {context, isInitial, dataValues, responses, candidate, showFormulas} = this.props
    return (
      <div className='flex-list'>
        <div className='flex-list' style={{alignSelf: 'flex-start'}}>
          <Toolbar/>
          {
            isInitial?
            'no current plot'
            :
            <div className="chart-container chart-highlight">
              <Header>Current plot</Header>
              <VegaLite
                spec={context}
                dataValues={dataValues}
              />

            </div>
          }
        </div>
        {
          showFormulas?
          <CandidatesTable responses={responses}/>
          : <Candidates candidate={candidate}/>
        }
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  isInitial: Object.keys(state.world.context).length === 0,
  context: state.world.context,
  dataValues: state.world.dataValues,
  count: state.user.count,
  showFormulas: state.world.showFormulas,
})
export default connect(mapStateToProps)(Build)
