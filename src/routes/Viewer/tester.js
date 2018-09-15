import React, {PureComponent} from 'react'
import { connect } from "react-redux"
import {SEMPREquery} from "helpers/sempre"
// import {applyPatch, createPatch, createTests} from 'rfc6902';
// import jsonpatch from "fast-json-patch"
import './styles.css'
// eslint-disable-next-line
const getInner = q => q.q[1]

class Tester extends PureComponent {
  total = 100000
  constructor(props) {
    super(props);
    this.state = {
      numDone: 0,
      numError: 0
    };
  }

  componentDidMount() {
    this.startTime = performance.now();
    for (let i = 0; i < this.total; i++){
      const sessionId = ""
      setTimeout( () => {
        SEMPREquery({q: ['q', {utterance: '', context: this.props.context, random: true, amount: 100}], sessionId: sessionId})
        .then(() => {
          this.setState({numDone: this.state.numDone+1})
        })
        .catch(() => {
          this.setState({numError: this.state.numError+1})
        })

      }, Math.random()*10000);
    }
  }

  render() {
    return (
        <div>
          <p> Server stress test: {this.state.numDone} : {this.state.numError} / {this.total} </p>
          <p> {this.finalTime - this.startTime} </p>
        </div>
    );
  }
}

const mapStateToProps = (state) => ({
  context: state.world.context,
})

export default connect(mapStateToProps)(Tester)
