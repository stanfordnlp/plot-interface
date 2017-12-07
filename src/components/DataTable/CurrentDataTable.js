import React from "react"
import {connect} from "react-redux";
import DataTable from 'components/DataTable'

import "./styles.css"

class CurrentDataTable extends React.Component {
  render() {
    if (this.props.schema === null)
      return null
    else
      return <DataTable className="source" values={this.props.values} schema={this.props.schema}/>
  }
}

const mapStateToProps = (state) => ({
  schema: state.world.schema,
  values: state.world.dataValues,
})
export default connect(mapStateToProps)(CurrentDataTable)
