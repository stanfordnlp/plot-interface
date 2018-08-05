import Ajv from 'ajv';
import {LocalLogger} from '../helpers/logger'
import * as vl from 'vega-lite';
import * as vega from 'vega';
import config from 'config.js'

const ajv = new Ajv({
  jsonPointers: true,
  allErrors: false
});

ajv.addMetaSchema(require('ajv/lib/refs/json-schema-draft-04.json'));

const vegaValidator = ajv.compile(require('../schema/vega/v4.2.0.json'));
const vegaLiteValidator = ajv.compile(require('../schema/vega-lite/v3.0.0-rc0.json'));

function validate(validator, spec, logger) {
  const valid = validator(spec);
  const messages = []
  if (!valid) {
    // console.log('not valid: ', spec, validator.errors)

    // generate human friendly error messages
    for (const error of validator.errors) {
      const key = error.keyword
      let message
      if (key === 'additionalProperties') {
        message = `${error.dataPath} should not have ${error.params.additionalProperty}`
      } else if (key === 'enum') {
        message = `${error.dataPath} ${error.message}: ${error.params.allowedValues.join(', ')}` // dataPath should be message
      } else if (key === 'type' || key === 'required' || key === 'maximum' || key === 'minimum') {
        message = `${key}: ${error.dataPath} ${error.message}` // dataPath should be message
      } else if (key === 'anyOf' || key === 'oneOf') {
        message = `${error.dataPath} ${error.message}`
      } else {
        message = JSON.stringify(error)
      }
      messages.push(message)
    }
    const uniqueMessages = messages.filter((item, pos) => messages.indexOf(item) === pos);
    for (const m of uniqueMessages) {
      logger.warn(`${m}`)
    }
  }
}

export function validateVegaLite(spec, logger) {
  validate(vegaLiteValidator, spec, logger)
}

export function validateVega(spec, logger) {
  validate(vegaValidator, spec, logger)
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
    // console.log(e)
    currLogger.error(e.message);
    return {vegaSpec: {}, logger: currLogger}
  }
  return {vegaSpec: vegaSpec, logger: currLogger}
}

export function vegaLiteToDataURLWithErrors(vegaLiteSpec, values) {
  // optionally specify the data
  const vegaWithErrors = parseWithErrors(vegaLiteSpec)

  // do not inject value when data is specified in the spec
  if (vegaLiteSpec.data !== undefined) values = null

  return vegaToDataURL(vegaWithErrors.vegaSpec, values)
    .then(dataURL => {return {dataURL, logger: vegaWithErrors.logger}}).catch(e => {console.log('vegaLiteToDataURLWithErrors error', e)})
}

export function vegaToDataURL(vegaSpec, values) {
  // console.log('called vegaToDataURL')
  let runtime;
  try {
    if (Object.keys(vegaSpec).length === 0 && vegaSpec.constructor === Object) {
      // console.log(vegaSpec)
      return Promise.resolve('data:,'+encodeURIComponent('empty spec'))
    }
    runtime = vega.parse(vegaSpec)
    let dataView = new vega.View(runtime)
    if (values !== null)
      dataView = dataView.insert('source', values)

    dataView.logLevel(config.logLevel)
    .width(500)
    .initialize()

    let dataURL
    if (config.renderer === 'png')
      dataURL = dataView.toImageURL('png')
    else
      dataURL = dataView.toSVG('svg');

    // console.log('vegaToDataURL success', vegaSpec, dataURL);
    return dataURL
  } catch (err) {
    console.log('vegaToDataURL error', vegaSpec, err)
    return Promise.resolve('data:,'+encodeURIComponent(err))
  }
}

export function prettyStringify(obj) {
 return JSON.stringify(obj, null, '\t')
}

const VegaLiteSpecs = require('../examples.json');
export function responsesFromExamples() {
  const filenames =   config.getExamples(VegaLiteSpecs).map(ex => ex.name + '.vl.json')// has name and title
  const urls = filenames.map(s => `spec/vega-lite/${s}`)
  const urlselect = [urls[Math.floor(Math.random()*urls.length)]]
  return Promise.all(urlselect.map(url => {
    return fetch(url).then(res => {
      return res.json().then(json => [url, json])
    })
  }))
  .then(specs =>
     specs.map((s) => {
       return {value: s[1], formula: s[0], canonical: s[0]}
     })
  )
}
