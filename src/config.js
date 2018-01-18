import * as vega from 'vega';

const config = {
  renderer: 'png', // png or svg
  // https://github.com/vega/vega-view/blob/master/README.md#view_logLevel
  // The valid level values are vega.None (the default), vega.Warn, vega.Info, vega.Debug
  logLevel: vega.Error
}

export default config