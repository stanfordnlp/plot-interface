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

export function vegaLiteToDataURL(vegaLiteSpec) {
  return vegaToDataURL(parseWithErrors(vegaLiteSpec).vegaSpec);
}

export function vegaLiteToDataURLWithErrors(vegaLiteSpec) {
  const vegaWithErrors = parseWithErrors(vegaLiteSpec);
  return vegaToDataURL(vegaWithErrors.vegaSpec)
    .then(dataURL => {return {dataURL, logger: vegaWithErrors.logger}})
}

export function vegaToDataURL(vegaSpec, element) {
  // console.log('called vegaToDataURL')
  let runtime;
  try {
    runtime = vega.parse(vegaSpec);
    let dataURL = new vega.View(runtime)
    .logLevel(vega.Error)
    .initialize()
    // .toImageURL('canvas')
    .toSVG('svg').then(svgStr => 'data:image/svg+xml;utf8,' + svgStr.replace(/#/gi, '%23') ); // should be one of svg, png etc. for svg, need to deference blobs...
    // this thing returns a promise
    return dataURL
  } catch (err) {
    console.log('vegaToDataURL error', err)
    return Promise.resolve('data:,'+encodeURIComponent(err))
  }
}

export function prettyStringify(obj) {
 return JSON.stringify(obj, null, 4)
}

const VegaLiteSpecs = require('../../public/spec/vega-lite/index.json');
export function responsesFromExamples() {
  const filenames = [...VegaLiteSpecs.TwentyDiverse] // has name and title
  const urls = filenames.map(s => `spec/vega-lite/${s.name}.vl.json`)

  return Promise.all(urls.map(url => {
    return fetch(url).then(res => {
      return res.json().then(json => [url, json])
    })
  }))
  .then(specs =>
     specs.map((s) => {
       return {value: s[1], formula: s[0]}
     })
  )
}
