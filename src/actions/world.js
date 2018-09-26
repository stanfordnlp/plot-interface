import { SEMPREquery } from "helpers/sempre"
import dsUtils from 'helpers/dataset-utils'
// import { persistStore } from "redux-persist"
// import { getStore } from "../"
import { STATUS } from "constants/strings"
import {responsesFromExamples} from '../helpers/vega-utils';
import Constants from 'actions/constants'
import config from 'config'

const Actions = {

  setState: (state) => {
    return (dispatch) => {
      dispatch({
        type: Constants.SET_STATE,
        state: state
      })
    }
  },

  setQuery: (query) => {
    return (dispatch) => {
      dispatch({
        type: Constants.SET_QUERY,
        query
      })
    }
  },

  getRandom: () => {
    return (dispatch, getState) => {
      const { sessionId } = getState().user
      const { context, schema, datasetURL } = getState().world

      dispatch({
        type: Constants.SET_STATUS,
        status: STATUS.LOADING
      })

      SEMPREquery({q: ['q', {utterance: '', context, schema, datasetURL, random: true}], sessionId: sessionId})
      .then((response) => {
        dispatch({
          type: Constants.SET_RESPONSES,
          responses: response.candidates
        })
        return true
      })
      .catch((e) => {
        console.log("getRandom failed", e)
        return false
      })
    }
  },

  tryQuery: (q) => {
    return (dispatch, getState) => {
      const { sessionId } = getState().user
      const { context, query, schema, datasetURL } = getState().world
      // if ('initialContext' in context) {
      //   window.alert('you need a starting plot before issuing a command');
      //   return
      // }
      dispatch({
        type: Constants.SET_STATUS,
        status: STATUS.LOADING
      })

      return SEMPREquery({ q: ['q', {utterance: q, context, schema, datasetURL}], sessionId: sessionId })
      .then((response) => {
        const candidates = response.candidates
        /* Remove no-ops */
        // const responses = candidates.filter((a) => {
        //   return a.value!==context
        // })
        dispatch({
          type: Constants.SET_ISSUED_QUERY,
          issuedQuery: query
        })

        // dispatch({
        //   type: Constants.SET_STATUS,
        //   status: 'Rendering'
        // })

        dispatch({
          type: Constants.SET_RESPONSES,
          responses: candidates
        })

        return true
      })
      .catch((e) => {
        console.log("tryQuery error?", e)
        return false
      })
    }
  },

  // spec is returned by the server, and maybe guaranteed to be correct?
  accept: (spec, formula) => {
    return (dispatch, getState) => {
      const { sessionId } = getState().user
      const { issuedQuery, context, schema, datasetURL } = getState().world

      const q = ['accept', {utterance: issuedQuery, taergetFormula: formula,
        context, schema, targetValue: spec, datasetURL}]
      SEMPREquery({ q: q, sessionId: sessionId }, () => { })

      dispatch({
        type: Constants.ACCEPT,
        target: spec
      })

      return true
    }
  },

  label: (utterance, spec, formula, type='label') => {
    return (dispatch, getState) => {
      const { sessionId } = getState().user
      const { context, schema, datasetURL, exampleId } = getState().world
      const sempreExample = {
        id: exampleId,
        utterance, targetFormula: formula,
        context, targetValue: spec, schema, datasetURL, type};
      console.log(JSON.stringify(sempreExample))
      const q = ['accept', sempreExample]
      return SEMPREquery({ q: q, sessionId: sessionId })
    }
  },

  log: (info) => {
    return (dispatch, getState) => {
      const { sessionId } = getState().user
      const q = ['log', info]
      SEMPREquery({ q: q, sessionId: sessionId }, () => { })
      return true
    }
  },

  clear: () => {
    return (dispatch, getState) => {
      dispatch({
        type: Constants.CLEAR
      })
      // persistStore(getStore(), { whitelist: ['world', 'user'] }, () => { }).purge()
    }
  },


  labelInit: (name) => {
    return (dispatch, getState) => {
      dispatch(Actions.clear())
      const {sessionId} = getState().user;
      responsesFromExamples(name).then(
        initial => {
          const context = initial[0].value
          // send the actual sempre command
          dispatch(Actions.updateContext(context)).then(() => {
            SEMPREquery({ q: ['q', {utterance: '', context, random: true, amount: config.numCandidates}], sessionId: sessionId})
            .then((response) => {
              console.log('sempre returned', response)
              if (response === undefined) {
                window.alert('Cannot inititate, no response from server')
                return
              }
              let candidates = response.candidates;
              if (candidates.length > config.numCandidates)
              candidates = candidates.slice(0, config.numCandidates)
              dispatch(Actions.setState({context, responses: candidates}))
            });
          })
        }).catch(e => console.log('labelInit', e))
      }
  },

  updateContext: (target) => {
    return (dispatch) => {
      if (target.data) {
        if (target.data.url) {
          return dsUtils.loadURL(target.data.url)
          .then(loaded => {
            const parsed = dsUtils.parseRaw(loaded.data),
            values = parsed.values,
            schema = dsUtils.schema(values)
            dispatch(Actions.setState({schema: schema, dataValues: values, datasetURL: target.data.url, }))
          })
          .catch(function(err) {
            console.log('updateContext error', err)
          });
        }
        if (target.data.values) {
          const values = target.data.values
          const schema = dsUtils.schema(values)
          dispatch(Actions.setState({schema: schema, dataValues: values, datasetURL: 'values',}))
          return Promise.resolve()
        }
      }
    }
  },

  verifierInit: (callBack) => {
    return (dispatch, getState) => {
      dispatch(Actions.clear())
      const {sessionId} = getState().user;
      SEMPREquery({q: ['example', {amount: 1}], sessionId})
      .then((exampleResponse) => {
        if (!exampleResponse) {
          window.alert('verifierInit: no response from server')
          return
        }
        const {context, targetValue, utterance, formula, id} = exampleResponse.master
        dispatch(Actions.updateContext(context)).then(() => {
          SEMPREquery({q: ['q', {utterance: '', context, random: true, amount: config.numCandidatesVerifier}], sessionId: sessionId}).then((response) => {
            // dispatch(Actions.updateContext(context))
            const target = {value: targetValue, score: 0, prob: 1, formula: formula, canonical: formula, isExample: true}
            if (response === undefined) {
              window.alert('no response from server')
              return
            }
            let candidates = [target, ...response.candidates];
            dispatch(Actions.setState({'issuedQuery': utterance, 'exampleId': id, responses: candidates, context}))
          })
        }).catch(err => console.log('verifierInit error', err))
    });
  }
}
}

export default Actions
