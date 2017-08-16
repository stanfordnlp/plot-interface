import { SEMPREquery } from "helpers/sempre"
import { persistStore } from "redux-persist"
import { getStore } from "../"
import { STATUS } from "constants/strings"
import {prettyStringify, parseWithErrors, responsesFromExamples} from '../helpers/vega-utils';
import Constants from 'actions/constants'

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

  tryQuery: (q) => {
    return (dispatch, getState) => {
      const { sessionId } = getState().user
      const { context, query, schema } = getState().world
      if ('initialContext' in context) {
        window.alert('you need a starting plot before issuing a command');
        return
      }
      dispatch({
        type: Constants.SET_STATUS,
        status: STATUS.LOADING
      })

      return SEMPREquery({ q: ['q', {utterance: q, context, schema, fields:Object.keys(schema)}], sessionId: sessionId })
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
          type: Constants.TRY_QUERY,
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
      const { issuedQuery, context, schema } = getState().world

      const q = ['accept', {utterance: issuedQuery, targetFormula:formula, type: "accept", context, schema, targetValue:spec}]
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
      const { issuedQuery, context, schema } = getState().world
      const sempreExample = {
        utterance, targetFormula: formula,
        context, schema, targetValue: spec, issuedQuery: issuedQuery, type: "label"};
      console.log(JSON.stringify(sempreExample))
      const q = ['accept', sempreExample]
      SEMPREquery({ q: q, sessionId: sessionId }, () => { })
      return true
    }
  },

  reject: (spec) => {
    return (dispatch, getState) => {
      const { sessionId } = getState().user
      const { query, context, schema} = getState().world

      const q = ['reject', {utterance: query, context, schema, targetValue:spec }]
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
      responsesFromExamples().then(responses =>
        dispatch({
          type: Constants.SET_RESPONSES,
          responses: responses
      })).catch(e => console.log('responseFromExamples', e))

      persistStore(getStore(), { whitelist: ['world', 'user'] }, () => { }).purge()
    }
  }
}

export default Actions
