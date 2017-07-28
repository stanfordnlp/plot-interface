import { SEMPREquery } from "helpers/sempre"
import { persistStore } from "redux-persist"
import { getStore } from "../"
import { STATUS } from "constants/strings"
import * as vl from 'vega-lite';
import {validateVegaLite, vegaLiteToHash, prettyStringify} from '../helpers/validate';
import {LocalLogger} from '../helpers/logger'
import Constants from 'actions/constants'

const Actions = {
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

  setContextHash: (contextHash) => {
    return (dispatch) => {
      dispatch({
        type: Constants.SET_CONTEXT_HASH,
        contextHash: contextHash
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
      const { context, query } = getState().world

      dispatch({
        type: Constants.SET_STATUS,
        status: STATUS.LOADING
      })

      return SEMPREquery({ q: ['q', q, context], sessionId: sessionId })
      .then((response) => {
        const candidates = response.candidates
        /* Remove no-ops */
        const responses = candidates.filter((a) => {
          return a.value!==context
        })
        dispatch({
          type: Constants.TRY_QUERY,
          responses: responses
        })

        dispatch({
          type: Constants.SET_ISSUED_QUERY,
          issuedQuery: query
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
      const { issuedQuery, context } = getState().world

      const q = ['accept', {utterance: issuedQuery, formula:formula, type: "accept", context:context, targetValue:spec}]
      SEMPREquery({ q: q, sessionId: sessionId }, () => { })

      dispatch({
        type: Constants.SET_CONTEXT_HASH,
        contextHash: vegaLiteToHash(spec)
      })

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
      const { issuedQuery, context } = getState().world

      const q = ['accept', {utterance: utterance, targetFormula: formula, type: "label", issuedQuery: issuedQuery, context: context, targetValue: spec }]
      SEMPREquery({ q: q, sessionId: sessionId }, () => { })
      return true
    }
  },

  reject: (spec) => {
    return (dispatch, getState) => {
      const { sessionId } = getState().user
      const { query, context } = getState().world

      const q = ['reject', {utterance: query, context:context, targetValue:spec }]
      SEMPREquery({ q: q, sessionId: sessionId }, () => { })

      return true
    }
  },

  updateSpec: () => {
    return (dispatch, getState) => {
      const { editorString } = getState().world
      const currLogger = new LocalLogger();
      let spec = {};
      try {
        spec = JSON.parse(editorString);
        validateVegaLite(spec, currLogger);
        vl.compile(spec, currLogger);
      } catch (e) {
        console.warn('json error? ', e);
      }
      dispatch({
        type: Constants.ACCEPT,
        target: spec
      })
      dispatch({
        type: Constants.SET_CONTEXT_HASH,
        contextHash: vegaLiteToHash(spec)
      })
    }
  },

  clear: () => {
    return (dispatch, getState) => {
      dispatch({
        type: Constants.CLEAR
      })
      persistStore(getStore(), { whitelist: ['world', 'user'] }, () => { }).purge()
    }
  }
}

export default Actions
