import React from 'react';
import PropTypes from 'prop-types';
import hash from 'string-hash'
import {parseWithErrors, vegaToDataURL} from 'helpers/vega-utils'
import "./styles.css"


// renders vegalite plot and display errors
class VegaLite extends React.Component {
  static propTypes = {
    spec: PropTypes.object,
    onDoneRendering: PropTypes.func,
    onError:  PropTypes.func,
  }

  constructor(props) {
    super(props)
    let spec = props.spec
    if (this.props.dataValues) {
      spec = JSON.parse(JSON.stringify(spec))
      spec.data = {values: this.props.dataValues}
    }
    const {vegaSpec, logger} = parseWithErrors(spec)
    const hasError = logger.warns.length > 0 || logger.errors.length > 0
    this.state = {vegaSpec: vegaSpec, logger: logger, hasError: hasError, dataURL: null}
  }

  componentWillReceiveProps(nextProps) {
    console.log('vegalite received props', nextProps, this.props)
    // if (this.props.spec !== nextProps.spec)
    {
      console.log('passed will receive props')
      let spec = nextProps.spec
      if (this.props.dataValues) {
        spec = JSON.parse(JSON.stringify(spec))
        spec.data = {values: this.props.dataValues}
      }
      const {vegaSpec, logger} = parseWithErrors(spec)
      const hasError = logger.warns.length > 0 || logger.errors.length > 0
      this.setState({vegaSpec: vegaSpec, logger: logger, hasError: hasError, dataURL: null})
    }
  }

  componentDidMount() {
    this.updateVegaWrap(this.props.spec)
  }

  componentDidUpdate(prevProps, prevStates) {
    if (this.state.dataURL!==prevStates.dataURL) {
      this.updateVegaWrap(this.props.spec)
    }
  }

  updateVegaWrap() {
    //if (this.props.onDoneRendering !== undefined)
    //setTimeout(() => this.updateVega(), 1000)
    this.updateVega()
  }
  // without the timeout, promise is sync...
  updateVega() {
    vegaToDataURL(this.state.vegaSpec).then(dataURL => {
      this.setState({dataURL: dataURL})
      // this.refs.chartImg.src = dataURL;
      if (this.props.onError!==undefined && this.state.hasError)
        this.props.onError()
      if (this.props.onDoneRendering !== undefined)
        this.props.onDoneRendering(dataURL)
      console.log('done rendering')
    }).catch(err => {
        console.log('updateVega error', err)
        this.setState({dataURL: 'data:text/plain,error'})
        //this.refs.chartImg.src='data:text/plain,error';
    })
  }

  test(e) {
    console.log('hash', hash(this.state.dataURL))
    console.log('info', {dataurl: this.state.dataURL})
  }

  render() {
    const errors = this.state.logger.errors.map((v, i) => <li className='display-errors' key={'error'+i}>{v}</li>)
    const warns = this.state.logger.warns.map((v, i) => <li className='display-warns' key={'warn'+i}>{v}</li>)

    return (
      <div>
        <div className='chart'>
          <div ref='chart' onClick={e => {this.test(e)}}>
             <img ref='chartImg' className='chart-img' alt='rendering...' src={this.state.dataURL}/>
          </div>
        </div>
        <div >
        {this.state.hasError?  <ul> {errors.concat(warns)} </ul> : null }
        </div>
      </div>
    )
  }
}

export default VegaLite;
