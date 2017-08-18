import React from "react"
import {connect} from "react-redux";
import DataTable from 'components/DataTable'
import dsUtils from 'helpers/dataset-utils'

import "./styles.css"

class CurrentDataTable extends React.Component {
  static propTypes = {
    context: React.PropTypes.object,
  }

  constructor(props) {
    super(props)
    this.state = {
      schema: null,
      values: null,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (!nextProps.context || !nextProps.context.data) {
      this.setState({schema: null})
      return
    }

    const context = nextProps.context
    if (nextProps.context===this.props.context)
      return;

    const setNewData = d => {
      const parsed = dsUtils.parseRaw(d);
      const values = parsed.values
      this.setState({values, schema: dsUtils.schema(values)})
    }

    if (context.data.values) {
      setNewData(context.data.values)
    } else {
      dsUtils.loadURL(context.data.url)
      .then(loaded => {
        setNewData(loaded.data)
      })
      .catch(function(err) {
        console.log(err)
      });
    }
  }


  render() {
    if (this.state.schema === null)
      return null
    else
      return <DataTable className="source" values={this.state.values} schema={this.state.schema}/>
  }
}

const mapStateToProps = (state) => ({
  context: state.world.context
})
export default connect(mapStateToProps)(CurrentDataTable)
