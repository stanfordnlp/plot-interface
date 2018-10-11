import React, {PureComponent} from 'react'
import PropTypes from 'prop-types';
import { connect } from "react-redux"
import { Card, Dropdown, Container, Header} from 'semantic-ui-react'

// import CurrentDataTable from 'components/DataTable/CurrentDataTable'
import Candidates from './candidates.js'
import VegaLite from "components/Plot/VegaLite"
import Toolbar from "components/Toolbar"
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
            <Toolbar/>
          </div>
          <div className="chart-container">
            <div>
             <Header size='medium'>Current Example</Header>
             {
              this.props.isInitial?
              'no current plot'
              :
              <VegaLite
                spec={this.props.context}
                dataValues={this.props.dataValues}
              />
            }
          </div>

          </div>
          <Candidates onLabel={this.onLabel} candidate={this.props.candidate}/>
        </div>
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
