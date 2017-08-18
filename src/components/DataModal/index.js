import React, {Component} from 'react'
import {connect} from 'react-redux'
import Modal from 'react-modal'
import Actions from "actions/world"
import DataTable from 'components/DataTable'
import dsUtils from 'helpers/dataset-utils'
import "./styles.css"
import exampleDatasets from 'constants/exampleDatasets'

var RawValuesTextArea = require('./RawValuesTextArea'),
    DataURL = require('./DataURL'),
    NAME_REGEX = dsUtils.NAME_REGEX;

class DataSource extends Component {
  constructor(props) {
    super(props)
    this.state = {
      error: null,
      success: null,
      selectedExample: null,
      preview: false,
    };
  }

  success(state, msg) {
    // this.props.dispatch(Actions.setState({schema: state.schema}))
    this.setState({...state,
      error: null,
      success: msg || null,
      preview: true,
    });
  }

  error(err) {
    this.setState({
      error: err.statusText || err.message || 'An error occured!',
      success: null,
      selectedExample: null,
      preview: false,
    });
  }

  loadURL(msg, url) {
    var that = this;
    msg = msg !== false ?
      'Successfully imported ' + url.match(NAME_REGEX)[0] + '!' : msg;

    dsUtils.loadURL(url)
      .then(loaded => {
        var parsed = dsUtils.parseRaw(loaded.data),
            values = parsed.values;

        this.success({
          values: values,
          schema: dsUtils.schema(values),
          selectedExample: url
        }, msg);
      })
      .catch(function(err) {
        console.log(err)
        that.error(err);
      });
  }

  importData() {
    this.props.dispatch(Actions.clear())
    this.props.dispatch(Actions.setState({schema: this.state.schema}))
    this.props.dispatch(Actions.setState({schema: this.state.schema}))
    this.props.dispatch(Actions.tryQuery(''))
    this.props.onRequestClose()
  }

  render() {
    const state = this.state,
    {error, success, preview} = this.state
    var style = {
      overlay: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      },
      content: {
        // position: null,
        overflow: 'hidden',
        top: null, bottom: null, left: null, right: null,
        width: '800px',
        height: (success || error || preview) ? 'auto' : '400px',
        padding: null
      }
    };

    return (
      <Modal isOpen={this.props.isOpen} onRequestClose={() => this.props.onRequestClose()} contentLabel="label-modal"
       style={style}>
       <div className="pipelineModal">
       <span className="closeModal" onClick={() => this.props.onRequestClose()}>close</span>
          <div className="examples">
            <h2>Example Datasets</h2>
            <ul>
              {exampleDatasets.map(function(example) {
                var name = example.name,
                    description = example.description,
                    url = example.url,
                    className = state.selectedExample === url ? 'selected' : null;

                return (
                  <li key={name} onClick={this.loadURL.bind(this, false, url)}
                    className={className}>
                    <p className="example-name">{name}</p>
                    <p>{description}</p>
                  </li>
                );
              }, this)}
            </ul>
          </div>

          <div className="load">
            <h2>Import a Dataset</h2>

            <p>
              Data must be in a tabular form. Supported import
              formats include <abbr title="JavaScript Object Notation">json</abbr>, <abbr title="Comma-Separated Values">csv</abbr> and <abbr title="Tab-Separated Values">tsv</abbr>
            </p>

            <DataURL loadURL={this.loadURL.bind(this, true)} />
            <RawValuesTextArea success={this.success} error={this.error} />
          </div>

          {error ? <div className="error-message">{error}</div> : null}
          {success ? <div className="success-message">{success}</div> : null}

          {!preview || error ? null : (
            <div className="preview">
              <h2>Preview</h2>

              <DataTable className="source"
                values={state.values} schema={state.schema} />

              <button className="active"
                onClick={() => this.importData()}>
                Import
              </button>
            </div>
          )}
        </div>
      </Modal>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    data : null
  };
}
export default connect(mapStateToProps)(DataSource)
