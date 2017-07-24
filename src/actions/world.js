import Constants from "constants/actions"
import { SEMPREquery } from "helpers/sempre"
import { persistStore } from "redux-persist"
import { getStore } from "../"
import { STATUS } from "constants/strings"


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

  tryQuery: (q) => {
    return (dispatch, getState) => {
      const { sessionId } = getState().user
      const { context } = getState().world

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
        return true
      })
      .catch((e) => {
        console.log("tryQuery error?", e)
        return false
      })
    }
  },


  accept: (spec) => {
    return (dispatch, getState) => {
      const { sessionId } = getState().user
      const { query, context } = getState().world

      const q = ['accept', {utterance: query, context:context, targetValue:spec }]
      SEMPREquery({ q: q, sessionId: sessionId }, () => { })

      dispatch({
        type: Constants.ACCEPT,
        target: spec
      })
      return true
    }
  },

  resetResponses: () => {
    return (dispatch) => {
      dispatch({
        type: Constants.RESET_RESPONSES
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
