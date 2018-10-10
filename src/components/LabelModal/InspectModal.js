import React, { Component } from "react"
import { connect } from "react-redux"
// import Modal from "react-modal"
import VegaLite from "components/Plot/VegaLite"
import { Checkbox, Button, Modal, Input, Menu} from 'semantic-ui-react'
import {prettyStringify, editorURL} from 'helpers/vega-utils'

class LabelModal extends Component {
  constructor(props) {
    super(props)
    this.state = {
      overlay: true
    }
  }

  toggleOverlay(evt) {
    this.setState({overlay: !this.state.overlay})
  }

  render() {
    const {context, candidate} = this.props
    const {overlay} = this.state

    const currentPlot = (
      <div className="half-panel">
        <div style={{top: '0px', paddingLeft: '100px', position: "relative"}}>
          <div className={this.state.overlay? "overlay-top" : "overlay-bot"} >
            <VegaLite spec={candidate.value} dataValues={this.props.dataValues} bigSize={true}/>
          </div>
          <div className={this.state.overlay? "overlay-bot" : "overlay-top"} >
            <VegaLite spec={context} dataValues={this.props.dataValues} bigSize={true}/>
          </div>
        </div>
    </div>
    )
    console.log('called render ', )

    return (
      <Modal size="large"
        open={true}
        onClose={() => this.props.onClose()}
        // onRequestClose={() => this.close()}
        // style={style}
        // contentLabel="label-modal"
        // ariaHideApp={false}
        // style={{content : {left:`${this.state.x}px`, top:`${this.state.y}px`}}}
      >
      <Modal.Header>
        Compare
        <div>{JSON.stringify(this.state.candidate)}</div>
      </Modal.Header>
      <Menu tabular>
        <Menu.Item
          name='old plot'
          active={!overlay}
          onClick={() => {this.setState({overlay: false})}}
        />
        <Menu.Item
          name='new plot'
          active={overlay}
          onClick={() => {this.setState({overlay: true})}}
        />
      </Menu>
      {currentPlot}

      <Modal.Actions>
        <Checkbox label="show new" onChange={() => this.toggleOverlay()} checked={this.state.overlay}/>
        <Button onClick={() => window.open(editorURL(prettyStringify(candidate.value)), '_blank')}>Open in Editor</Button>
        <Button negative onClick={() => this.props.onClose()}>Close</Button>
      </Modal.Actions>
    </Modal>
    )
  }
}

const mapStateToProps = (state) => ({
  issuedQuery: state.world.issuedQuery,
  context: state.world.context,
  dataValues: state.world.dataValues,
  schema: state.world.schema,
})

export default connect(mapStateToProps)(LabelModal)
