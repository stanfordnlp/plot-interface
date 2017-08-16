import React, {Component} from 'react'
import {connect} from 'react-redux'
import dl from 'datalib'
import {MdKeyboardArrowLeft, MdKeyboardArrowRight} from 'react-icons/lib/md'
import Actions from "actions/world"

import "./styles.css"

class DataTable extends Component {
  constructor(props) {
    super(props)
    this.state = {
      limit: 20,
      page: 0,
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!nextProps.spec || !nextProps.spec.data) {
      this.setState({data: null})
      return
    }

    if (nextProps.spec.data===this.props.spec.data)
      return

    const data = nextProps.spec.data
    const dataset  = this.parseRaw(data.values || dl.load(data))
    const schema = this.schema(dataset.values)

    this.props.dispatch(Actions.setState({schema: schema}))

    console.log(schema)
    this.setState({schema, output: dataset.values, data: data})
  }

  prevPage() {
    this.setState({page: --this.state.page})
  }

  nextPage() {
    this.setState({page: ++this.state.page})
  }

  parseRaw(raw) {
    const format = {parse: 'auto'}
    let parsed;
    try {
      format.type = 'json';
      return {format: format, values: dl.read(raw, format)};
    } catch (error) {
      format.type = 'csv';
      parsed = dl.read(raw, format);

      // Test successful parsing of CSV/TSV data by checking # of fields found.
      // If file is TSV but was parsed as CSV, the entire header row will be
      // parsed as a single field.
      if (dl.keys(parsed[0]).length > 1) {
        return {format: format, values: parsed};
      }

      format.type = 'tsv';
      parsed = dl.read(raw, format);
      if (dl.keys(parsed[0]).length > 1) {
        return {format: format, values: parsed};
      }

      throw Error('Raw data is in an unsupported format. ' +
        'Only JSON, CSV, or TSV may be imported.');
    }
  }

  /**
   * Returns the schema of the dataset associated with the given id
   * or processes the schema based on the dataset's actual values
   *
   * @param  {number|Array} arg - An array of raw values to calculate a schema for.
   * @returns {Object} The dataset's schema.
   */
   schema(arg) {
    if (dl.isNumber(arg)) {
      throw Error('Dataset schemas are now available in the store.');
    } else if (dl.isArray(arg)) {
      var types = dl.type.inferAll(arg);
      return dl.keys(types).reduce(function(s, k) {
        s[k] = {
          name: k,
          type: types[k],
          source: true
        };
        return s;
      }, {});
    }
    throw Error('Expected an array of raw values.');
  }

  clickHeader(e, header) {
    this.props.dispatch(Actions.setQuery((this.props.query + ' ' + header).trim()))
  }

  render() {
    const {page, limit, schema, output, data}  = this.state
    if (!data) return <div className="dataTable">no data available</div>

    const start = page * limit
    const stop  = start + limit

    const values = output.slice(start, stop)
    const keys = dl.keys(schema)
    const max = output.length
    const fmt = dl.format.auto.number()

    let prev = page > 0 ? (
      <MdKeyboardArrowLeft className='md-button' size={30} onClick={() => this.prevPage()} />
    ) : null;

    let next = page + 1 < max / limit ? (
      <MdKeyboardArrowRight className='md-button' size={30} onClick={() => this.nextPage()} />
    ) : null;

    return (
      <div>
        <div className="dataTable">
          <table>
            <tbody>
              {keys.map(function(k) {
                return (
                  <tr key={k}>
                    <td className="schema" onClick={e => this.clickHeader(e, k)}>{k}</td>
                    {values.map(function(v, i) {
                      return (
                        <td key={k + i} className={i % 2 ? 'even' : 'odd'}>{v[k]}</td>
                      );
                    }, this)}
                  </tr>
                );
              }, this)}
            </tbody>
          </table>
        </div>

        <div className="paging">
          <span>{fmt(start + 1)}–{stop > max ? fmt(max) : fmt(stop)} of {fmt(max)}</span>
          <span className="pager">{prev} {next}</span>
        </div>
      </div>
    );
  }
}


function mapStateToProps(state, ownProps) {
  return {
    spec : state.world.context,
    query: state.world.query,
  };
}

export default connect(mapStateToProps)(DataTable)
