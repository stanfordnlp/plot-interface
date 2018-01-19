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

const vegaValidator = ajv.compile(require('../../schema/vega.schema.json'));
const vegaLiteValidator = ajv.compile(require('../../schema/vl.schema.json'));

function validate(validator, spec, logger) {
  const valid = validator(spec);
  const messages = []
  if (!valid) {
    // console.log('not valid: ', spec, validator.errors)

    for (const error of validator.errors) {
      const key = error.keyword
      let message
      if (key === 'additionalProperties') {
        message = `should not have additionalProperties ${error.params.additionalProperty}`
      } else if (key === 'type') {
        message = `${error.dataPath} ${error.message}` // dataPath should be message
      } else if (key === 'anyOf') {
        message = `${error.message}`
      } else {
        message = JSON.stringify(error)
      }
      messages.push(message)
    }
    const uniqueMessages = messages.filter((item, pos) => messages.indexOf(item) === pos);
    for (const m of uniqueMessages) {
      logger.warn(`VegaLite: ${m}`)
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
  const vegaWithErrors = parseWithErrors(vegaLiteSpec);
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

    runtime = vega.parse(vegaSpec);
    const dataView = new vega.View(runtime)
    .insert('source', values)
    .logLevel(config.logLevel)
    .initialize()

    let dataURL
    if (config.renderer === 'png')
      dataURL = dataView.toImageURL('png')
    else
      dataURL = dataView.toSVG('svg').then(svgStr => 'data:image/svg+xml;utf8,' + svgStr.replace(/#/gi, '%23') );

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
       return {value: s[1], formula: s[0], canonical: s[0]}
     })
  )
}
