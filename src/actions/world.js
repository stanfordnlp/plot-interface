import { SEMPREquery } from "helpers/sempre"
import dsUtils from 'helpers/dataset-utils'
// import { persistStore } from "redux-persist"
// import { getStore } from "../"
import { STATUS } from "constants/strings"
import {prettyStringify, parseWithErrors} from '../helpers/vega-utils';
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

  setEditorString: (editorString) => {
    return (dispatch) => {
      dispatch({
        type: Constants.SET_EDITOR_STRING,
        editorString: editorString
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
        type: Constants.SET_EDITOR_STRING,
        editorString: prettyStringify(spec)
      })

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

  updateSpec: () => {
    return (dispatch, getState) => {
      const { editorString } = getState().world
      let spec = {};
      try {
        spec = JSON.parse(editorString)
        const {logger} = parseWithErrors(spec)
        if (logger.warns.length > 0 || logger.errors.length > 0) {
          window.alert('current spec has errors and cannot be used')
          console.log('validation errors', logger)
          return
        }
      } catch (e) {
        console.error('spec error', e);
        return
      }
      dispatch({
        type: Constants.ACCEPT,
        target: spec
      })
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

  initData: (datasetURL) => {
    return (dispatch, getState) => {
      if (datasetURL === undefined) {
        const routing = getState().routing
        const location = routing.location || routing.locationBeforeTransitions
        const datasetURL = location.query.dataset
        if (datasetURL === undefined) return false
      } else {
        return dsUtils.loadURL(datasetURL)
          .then(loaded => {
            const parsed = dsUtils.parseRaw(loaded.data),
            values = parsed.values,
            schema = dsUtils.schema(values)
            dispatch(Actions.setState({schema: schema, dataValues: values, datasetURL: datasetURL}))
          })
          .catch(function(err) {
            console.log(err)
          });
      }
    }
  },

  labelInit: (useRandomInitial) => {
    return (dispatch, getState) => {
      dispatch({
        type: Constants.CLEAR
      })
      Promise.resolve(dispatch(Actions.initData())).then(() => {
        const {sessionId} = getState().user;
        const { context, schema, datasetURL } = getState().world

        let initQuery = () => {};
        if (config.useRandomInitial)
          initQuery = () => SEMPREquery({q: ['q', {utterance: '', context, schema, datasetURL, random: true, amount: config.numCandidates}], sessionId: sessionId})

        Promise.resolve(initQuery()).then(
          initial => {
          if (config.useRandomInitial) {
            dispatch({
              type: Constants.ACCEPT,
              target: initial.candidates[0].value
            })
          }

          const {context} = getState().world;
          // send the actual sempre command
          SEMPREquery({ q: ['q', {utterance: '', context, schema, datasetURL, random: true, amount: config.numCandidates}], sessionId: sessionId})
          .then((response) => {
            // console.log('sempre returned', response)
            let candidates = response.candidates;
            if (candidates.length > config.numCandidates)
              candidates = candidates.slice(0, config.numCandidates)
            dispatch({
              type: Constants.SET_RESPONSES,
              responses: candidates
            })
          });
        }).catch(e => console.log('labelInit', e))
      })
    }
  }
}

export default Actions
