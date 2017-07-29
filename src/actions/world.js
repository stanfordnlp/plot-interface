import { SEMPREquery } from "helpers/sempre"
import { persistStore } from "redux-persist"
import { getStore } from "../"
import { STATUS } from "constants/strings"
import {vegaLiteToDataURL, prettyStringify, parseWithErrors} from '../helpers/vega-utils';
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
        // const responses = candidates.filter((a) => {
        //   return a.value!==context
        // })
        console.log('server returned results')
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

        dispatch({
          type: Constants.SET_STATUS,
          status: STATUS.TRY
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

      const q = ['accept', {utterance: issuedQuery, tagetFormula:formula, type: "accept", context:context, targetValue:spec}]
      SEMPREquery({ q: q, sessionId: sessionId }, () => { })


      vegaLiteToDataURL(spec).then(dataURL =>
      dispatch({
        type: Constants.SET_CONTEXT_HASH,
        contextHash: dataURL
      })).catch((err) => {console.log('SET_CONTEXT_HASH error', err)})

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
      let spec = {};
      try {
        spec = JSON.parse(editorString)
        const {logger} = parseWithErrors(spec)
        if (logger.warns.length > 0 || logger.errors.length > 0) {
          window.alert('current spec has errors and cannot be used')
          console.log('validation errors', logger)
        }
      } catch (e) {
        console.error('spec error', e);
      }
      dispatch({
        type: Constants.ACCEPT,
        target: spec
      })

      vegaLiteToDataURL(spec).then(dataURL =>
      dispatch({
        type: Constants.SET_CONTEXT_HASH,
        contextHash: dataURL
      })).catch((err) => {console.log('SET_CONTEXT_HASH error', err)})
    }
  },

  updateContextHash: () => {
    return (dispatch, getState) => {
      const { context } = getState().world
      vegaLiteToDataURL(context).then(dataURL =>
      dispatch({
        type: Constants.SET_CONTEXT_HASH,
        contextHash: dataURL
      })).catch((err) => {console.log('SET_CONTEXT_HASH error', err)})
    }
  },

  clear: () => {
    return (dispatch, getState) => {
      dispatch({
        type: Constants.CLEAR
      })
      const { context } = getState().world
      vegaLiteToDataURL(context).then(dataURL =>
      dispatch({
        type: Constants.SET_CONTEXT_HASH,
        contextHash: dataURL
      })).catch((err) => {console.log('SET_CONTEXT_HASH error', err)})
      persistStore(getStore(), { whitelist: ['world', 'user'] }, () => { }).purge()
    }
  }
}

export default Actions
