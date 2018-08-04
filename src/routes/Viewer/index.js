import React, {Component} from 'react'
import PropTypes from 'prop-types';
import { connect } from "react-redux"
import LabelModal from 'components/LabelModal'
import Actions from "actions/world"
import './styles.css'
// eslint-disable-next-line
const turk2018url = 'https://raw.githubusercontent.com/stanfordnlp/plot-data/master/20180118_turk_all.jsonl'
const remotelogs = 'http://jonsson.stanford.edu:8405/query.jsonl'

class Viewer extends Component {
  static propTypes = {
    /* Injected by Redux */
    context: PropTypes.object,
    candidate: PropTypes.func,
    dispatch: PropTypes.func,
  }
  constructor(props) {
  super(props);
    this.state = {
      examples: [],
      url: remotelogs,
      isQuerylog: true,
    };
  }

  componentDidMount() {
    this.fetchFromURL()
  }

  fetchFromURL() {
    console.log(this.state.url)
    fetch(this.state.url)
      .then(response => {response.text().then(t => this.loadJSONL(t))})
  }

  onLabel = (spec, formula) => {
  };

  loadJSONL(contents) {
    // console.log(contents)
    const raw = contents.trim().split('\n').map((c, i) => {
      try {
        return JSON.parse(c);
      } catch(e) {
        alert(e); // error in the above string (in this case, yes)!
      }
      return null;
    })

    let examples = raw;
    if (this.state.isQuerylog) {
      examples = raw.filter(r => r.q[0]==="accept")
    }

    this.setState({examples: examples})
  }

  handleFiles(f: FileList) {
    if (f) {
      const r = new FileReader();
      r.onload = e => {
	      this.loadJSONL(e.target.result);
      }
      r.readAsText(f[0]);
    } else {
      alert("Failed to load file");
    }
  }

  openInEditor(spec) {
    window.open('https://vega.github.io/editor/').postMessage({
      mode: 'vega-lite',
      spec: JSON.stringify(spec, null, 2),
    }, '*');
  }

  onInspect = (example) => {
    this.props.dispatch(Actions.setState({issuedQuery: example.utterance, context: example.context}))
    // this.props.dispatch(Actions.initData(example.datasetURL))
    // console.log('onInspect', example.utterance)
    setTimeout(() => {this.labelModal.onLabel(example.targetValue, example.targetFormula)}, 0)
    return false
  };

  render() {
    const {examples} = this.state
    // eslint-disable-next-line
    return (
      <div className="exampleTable">
        <input type="file" id="input" onChange={e => this.handleFiles(e.target.files)}/>
        ULR: <input type="text" style={ {width:'500px'} } id="exampleURL" value={this.state.url} onChange={e => {this.setState({url: e.target.value})}}/>
        {/* {examples} */}
        <button onClick={e => this.fetchFromURL()}>load</button>
        <table>
          <tbody>
            {
              examples.map((q, r) => {
                const c = q.q[1]
                return (
                  <tr key={r} className={r % 2 ? 'even' : 'odd'}>
                    <td> <a
                      // eslint-disable-next-line
                      href="javascript:void(0);" onClick={e => this.onInspect(c)}> {r} </a> </td>
                    {/* <td> <span onClick={e => this.openineditor(c.context)}> context </span> </td> */}
                    {/* <td> <span onClick={e => this.openineditor(c.spec)}> spec </span> </td> */}
                    <td>{c.utterance}</td>
                    <td>{typeof c.targetFormula === 'string'? c.targetFormula: JSON.stringify(c.targetFormula)}</td>
                    <td>{q.sessionId}</td>
                  </tr>
                );
              })
            }
          </tbody>
        </table>
        <LabelModal onRef={ref => (this.labelModal = ref)}/>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
})

export default connect(mapStateToProps)(Viewer)
