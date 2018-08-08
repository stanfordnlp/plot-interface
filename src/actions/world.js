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

  setStatus: (status) => {
    return (dispatch) => {
      dispatch({
        type: Constants.SET_STATUS,
        status
      })
    }
  },

  setShowErrors: (showErrors) => {
    return (dispatch) => {
      dispatch({
        type: Constants.SET_SHOW_ERRORS,
        showErrors: showErrors
      })
    }
  },

  setShowFormulas: (showFormulas) => {
    return (dispatch) => {
      dispatch({
        type: Constants.SET_SHOW_FORMULAS,
        showFormulas: showFormulas
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

      const q = ['accept', {utterance: issuedQuery, targetFormula: formula,
        context, schema, targetValue:spec, datasetURL, type: "accept"}]
      SEMPREquery({ q: q, sessionId: sessionId }, () => { })

      dispatch({
        type: Constants.ACCEPT,
        target: spec
      })

      return true
    }
  },

  label: (utterance, spec, formula) => {
    return (dispatch, getState) => {
      const { sessionId } = getState().user
      const { issuedQuery, context, schema, datasetURL } = getState().world
      const sempreExample = {
        utterance, targetFormula: formula,
        context, schema, targetValue: spec, issuedQuery: issuedQuery, datasetURL, type: "label"};
      console.log(JSON.stringify(sempreExample))
      const q = ['accept', sempreExample]
      SEMPREquery({ q: q, sessionId: sessionId }, () => { })
      return true
    }
  },

  reject: (spec, isBad) => {
    return (dispatch, getState) => {
      const { sessionId } = getState().user
      const { query, context, schema, datasetURL} = getState().world

      const q = ['reject', {unreject: isBad, utterance: query, context, schema, targetValue:spec, datasetURL }]
      SEMPREquery({ q: q, sessionId: sessionId }, () => { })

      return true
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


  labelInit: () => {
    return (dispatch, getState) => {
      dispatch({
        type: Constants.CLEAR
      })
      const {sessionId} = getState().user;
      responsesFromExamples().then(
        initial => {
          const context = initial[0].value
          dispatch(Actions.updateContext(context))
          const {schema, datasetURL } = getState().world
          // send the actual sempre command
          SEMPREquery({ q: ['q', {utterance: '', context, schema, datasetURL, random: true, amount: config.numCandidates}], sessionId: sessionId})
          .then((response) => {
            console.log('sempre returned', response)
            if (response === undefined) {
              window.alert('no response from server')
              return
            }
            let candidates = response.candidates;
            if (candidates.length > config.numCandidates)
            candidates = candidates.slice(0, config.numCandidates)
            dispatch({
              type: Constants.SET_RESPONSES,
              responses: candidates
            })
          });
        }).catch(e => console.log('labelInit', e))
      }
  },

  updateContext: (target) => {
    return (dispatch) => {
      dispatch({
        type: Constants.ACCEPT,
        target: target,
      })
      if (target.data) {
        // TODO: there is a bug here since initData is async, the rest of it will be wrong
        if (target.data.url) {
          dsUtils.loadURL(target.data.url)
          .then(loaded => {
            const parsed = dsUtils.parseRaw(loaded.data),
            values = parsed.values,
            schema = dsUtils.schema(values)
            dispatch(Actions.setState({schema: schema, dataValues: values, datasetURL: target.data.url}))
          })
          .catch(function(err) {
            console.log(err)
          });
        }
        if (target.data.values) {
          const values = target.data.values
          const schema = dsUtils.schema(values)
          dispatch(Actions.setState({schema: schema, dataValues: values, datasetURL: 'values'}))
        }
      }
    }
  },

  verifierInit: () => {
    return (dispatch, getState) => {
      const {sessionId} = getState().user;
      dispatch({
        type: Constants.CLEAR
      })
      SEMPREquery({q: ['example', {amount: 20}], sessionId})
      .then((exampleResponse) => {
        const {context, targetValue, utterance} = exampleResponse.master
        const {schema, datasetURL } = getState().world
        dispatch(Actions.updateContext(context))
        SEMPREquery({q: ['q', {utterance: '', context, schema, datasetURL, random: true, amount: 20}], sessionId: sessionId}).then((response) => {
          const target = {value: targetValue, score: 0, prob: 1, formula: '', canonical: utterance}
          dispatch(Actions.setState({'issuedQuery': utterance, 'targetValue': targetValue}))
          if (response === undefined) {
            window.alert('no response from server')
            return
          }
          let candidates = [target, ...response.candidates];
          if (candidates.length > config.numCandidates)
          candidates = candidates.slice(0, config.numCandidates)
          dispatch({
            type: Constants.SET_RESPONSES,
            responses: candidates
          })
        });
    });
  }
}
}

export default Actions
