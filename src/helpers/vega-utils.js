import Ajv from 'ajv';
import {LocalLogger} from '../helpers/logger'
import * as vl from 'vega-lite';
import * as vega from 'vega';


const ajv = new Ajv({
  jsonPointers: true,
  allErrors: false
});

ajv.addMetaSchema(require('ajv/lib/refs/json-schema-draft-04.json'));

const vegaValidator = ajv.compile(require('../../schema/vega.schema.json'));
const vegaLiteValidator = ajv.compile(require('../../schema/vl.schema.json'));

export function validateVegaLite(spec, logger) {
  const valid = vegaLiteValidator(spec);
  if (!valid) {
    for (const error of vegaLiteValidator.errors) {
      logger.warn(`ValidationVegaLite: ${error.dataPath} ${error.message}`);
    }
  }
}

export function validateVega(spec, logger) {
  const valid = vegaValidator(spec);
  if (!valid) {
    for (const error of vegaValidator.errors) {
      logger.warn(`ValidationVega: ${error.dataPath} ${error.message}`);
    }
  }
}

export function parseAndCheckStr(jsonStr) {
  return parseWithErrors(JSON.parse(jsonStr))
}

export function parseWithErrors(spec) {
  const currLogger = new LocalLogger();
  let vegaSpec
  try {
    validateVegaLite(spec, currLogger);
    vegaSpec = vl.compile(spec, currLogger).spec;
    validateVega(vegaSpec, currLogger);
  } catch (e) {
    currLogger.error(e.message);
    return {vegaSpec: {}, logger: currLogger}
  }
  return {vegaSpec: vegaSpec, logger: currLogger}
}

export function vegaLiteToHash(vegaLiteSpec) {
  return vegaHash(vegaToDataURL(parseWithErrors(vegaLiteSpec).vegaSpec));
}

export function vegaHash(chart) {
  return chart
}

export function vegaToDataURL(vegaSpec) {
  //let chart = document.createElement('div')
  let chart = document.getElementById('fake-chart')
  console.log('called vegaToDataURL')
  chart.style.width = '100px' // chart.getBoundingClientRect().width + 'px';
  let runtime;
  try {
    runtime = vega.parse(vegaSpec);
    let view = new vega.View(runtime)
    .logLevel(vega.Error)
    //.initialize()
    .initialize(chart)
    .renderer('Canvas');
    view.run();
    chart.style.width = 'auto';
    const dataurl = chart.children[0].toDataURL()
    return dataurl
  } catch (err) {
    console.log('VegaLite.error %s', err.toString());
  }
  return null
}

export function prettyStringify(obj) {
 return JSON.stringify(obj, null, 4)
}
