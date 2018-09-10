import React, {PureComponent} from 'react'
import { connect } from "react-redux"

import LabelModal from 'components/LabelModal'
import Actions from "actions/world"
import {getParameterByName, canonicalJsonDiff} from "helpers/util"
// import {applyPatch, createPatch, createTests} from 'rfc6902';
// import jsonpatch from "fast-json-patch"
import './styles.css'
// eslint-disable-next-line
const remotelogs = ''
const getInner = q => q.q[1]

class Viewer extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      examples: [],
      url: remotelogs,
      shown: [],
    };
  }

  componentDidMount() {
    const url = getParameterByName('url')
    console.log(url)
    if (url != null) {
      this.fetchFromURL(url)
      this.setState({url})
    }
  }

  fetchFromURL(url) {
    console.log(url)
    fetch(url)
      .then(response => {response.text().then(t => this.loadJSONL(t))})
  }

  sortAndShow(examples, key) {
    examples.sort((q1, q2) => {
      const [v1, v2] = [q1[key], q2[key]]
      if (v1 > v2) return 1
      if (v1 < v2) return -1
      else return 0
    })

    console.log(examples.slice(0,10))

    this.setState({examples: examples, shown: []})
    this.showMore()
  }

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
    examples = raw.filter(r => r.q[0]==="accept")

    examples.forEach(q => {
      q.diff = canonicalJsonDiff(getInner(q).context, getInner(q).targetValue)
      if (q.stats) {
        q.acc = (q.stats.correct + 0.2) / (q.stats.correct + q.stats.wrong + q.stats.skip*0.2 + 1)
      } else {
        q.acc = 0
      }

    })

    this.sortAndShow(examples, 'count')
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

  showMore = () => {
    setTimeout(() => {
      let hasMore = this.state.shown.length < this.state.examples.length;
      this.setState( (prev) => ({
        shown: this.state.examples.slice(0, prev.shown.length + 100)
      }));
      if (hasMore) this.showMore();
    }, 0);
  }

  render() {
    const {examples, shown} = this.state
    // eslint-disable-next-line
    return (
      <div className="exampleTable">
        <input type="file" id="input" onChange={e => this.handleFiles(e.target.files)}/>
        ULR: <input type="text" style={ {width:'500px'} } id="exampleURL" value={this.state.url} onChange={e => {this.setState({url: e.target.value})}}/>
        {/* {examples} */}
        <button onClick={e => this.fetchFromURL(this.state.url)}>load</button>
        <table>
          <tbody>
              <tr>
                <th>id</th>
                <th onClick={() => this.sortAndShow(examples, 'count')}>count</th>
                <th>utt</th>
                <th onClick={() => this.sortAndShow(examples, 'diff')}>diff</th>
                <th onClick={() => this.sortAndShow(examples, 'sessionId')}>worker</th>
                <th onClick={() => this.sortAndShow(examples, 'acc')}>acc</th>
              </tr>
              {
                shown.map((q, index) => {
                  if (q === undefined) return <tr> Loading </tr>
                  const ex = getInner(q)
                  return (
                    <tr key={index} className={index % 2 ? 'even' : 'odd'}>
                      <td onClick={e => this.onInspect(ex)}>{index}</td>
                      <td>{q.count}</td>
                      <td>{ex.utterance}</td>
                      <td>{q.diff}</td>
                      <td>{q.sessionId.substring(0,15)}</td>
                      <td>{(q.acc).toFixed(3)}</td>
                    </tr>
                  )
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
