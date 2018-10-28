import React, {PureComponent} from 'react'
import PropTypes from 'prop-types';
import { connect } from "react-redux"
import { Icon, Header} from 'semantic-ui-react'

// import CurrentDataTable from 'components/DataTable/CurrentDataTable'
import Candidates from './candidates.js'
import VegaLite from "components/Plot/VegaLite"
import Toolbar from "components/Toolbar"
import CommandBar from "components/CommandBar/simple"

import Actions from "actions/world"
import {examplesList} from '../../helpers/vega-utils';
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
        <div className='flex-list'>
            <Toolbar/>
            {
              this.props.isInitial?
              'no current plot'
              :
              <div className="chart-container chart-highlight pinhalfp" style={{marginRight: "25px"}}>
                <Header size='medium'>Current plot</Header>
                <VegaLite
                  spec={this.props.context}
                  dataValues={this.props.dataValues}
                />
                {/* <Icon className="pinhalfc" name="arrow right" size="big"/> */}
              </div>
            }
            <Candidates onLabel={this.onLabel} candidate={this.props.candidate}/>
          </div>
    )
  }
}

const mapStateToProps = (state) => ({
  isInitial: Object.keys(state.world.context).length === 0,
  context: state.world.context,
  dataValues: state.world.dataValues,
  count: state.user.count,
})
export default connect(mapStateToProps)(Build)
