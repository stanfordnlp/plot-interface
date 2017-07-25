import React, { Component, PropTypes } from 'react'
import Actions from "actions/world"
import { connect } from "react-redux"
import Plot from "plot/Plot"
import { STATUS } from "constants/strings"
import Editor from "components/Editor"
import "./styles.css"
import SplitPane from 'react-split-pane';

class Build extends Component {
  static propTypes = {
    /* Injected by Redux */
    status: PropTypes.string,
    context: PropTypes.object,
    responses: PropTypes.array,
    dispatch: PropTypes.func,
  }

  handleQuery(query) {
    switch (this.props.status) {
      case STATUS.TRY:
        /* Try the query */
        this.props.dispatch(Actions.tryQuery(query))
        break
      case STATUS.ACCEPT:
        /* Otherwise, just accept normally */
        break
      case STATUS.LOADING:
        this.props.dispatch(Actions.setStatus(STATUS.TRY))
        break
      default:
        console.log("uh oh... unknown status!", this.props.status)
        break
    }
  }

  render() {
    const {responses } = this.props
    let plots = responses.map((r, ind) =>
      (
        <Plot spec={r.value} key={ind}/>
      )
    );
    const splitPane = true;
    return (
      splitPane?
      <div style={{position: 'relative', height: `calc(100vh - ${50}px)`}}>
          <SplitPane split="vertical" minSize={300} defaultSize={window.innerWidth * 0.4} pane1Style={{display: 'flex'}} className='main-pane' pane2Style={{overflow: 'scroll'}}>
            <Editor/>
            <div className="Candidates">
              {plots}
            </div>
          </SplitPane>
      </div>
      :
      <div className="Build">
        <div className="Build-world">
          {plots}
        </div>
        <Editor/>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  status: state.world.status,
  responses: state.world.responses,
  context: state.world.context
})

export default connect(mapStateToProps)(Build)
