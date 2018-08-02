const config = {
  renderer: 'png', // png or svg
  // https://github.com/vega/vega-view/blob/master/readme.md#view_loglevel
  // the valid level values are vega.none (the default), vega.warn, vega.info, vega.debug
  loglevel: 'error',
  numLabels: 10,
  numCandidates: 50,
  showFormula: true,
  useServerInitial: false,
  showDiffEditor: true,
  getExamples: getExamples,
}

function getExamples(exjson) {
// https://raw.githubusercontent.com/vega/vega-lite/master/_data/examples.json
// takes this file as input and return a flat list of allowed examples
  let all = [
    ...exjson["Single-View Plots"]["Bar Charts & Histograms"].filter(v => !v.name.startsWith('isotype')),
    ...exjson["Single-View Plots"]["Scatter & Strip Plots"],
    ...exjson["Single-View Plots"]["Line Charts"],
    ...exjson["Single-View Plots"]["Area Charts & Streamgraphs"],
    ...exjson["Single-View Plots"]["Table-based Plots"],
    ...exjson["Composite Mark"]["Error Bars & Error Bands"],
    ...exjson["Composite Mark"]["Box Plots"],
  ]
  console.log(all)
  return all
}

export default config
