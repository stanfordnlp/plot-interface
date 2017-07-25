import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import VegaLite from "../VegaLite"

class ContextOverlay extends React.Component {
  static propTypes = {
    context: PropTypes.object,
    show: PropTypes.bool,
  }

  constructor(props) {
    super(props)
    this.state = {show : props.show}
  }

  componentDidMount() {
      this.props.onRef(this)
    }

  componentWillUnmount() {
    this.props.onRef(undefined)
  }

  toggle() {
    console.log("update toggle");
    this.setState({show: !this.state.show})
  }

  render() {
    if (this.state.show)
        return <VegaLite spec={this.props.context}/>
    else return null
  }
  componentDidUpdate() {
    console.log("update contextoverlay");
  }
}

const mapStateToProps = (state) => ({
  context: state.world.context
})
export default connect(mapStateToProps)(ContextOverlay);
