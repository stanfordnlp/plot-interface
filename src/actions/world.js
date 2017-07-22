import Constants from "constants/actions"
import { SEMPREquery } from "helpers/sempre"
import Logger from "actions/logger"
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

  undo: () => {
    return (dispatch, getState) => {
      const { current_history_idx, history } = getState().world

      const idx = current_history_idx !== 0 ? (current_history_idx >= 0 ? current_history_idx - 1 : history.length - 2) : current_history_idx

      dispatch({
        type: Constants.REVERT,
        idx: idx
      })
    }
  },

  redo: () => {
    return (dispatch, getState) => {
      const { current_history_idx, history } = getState().world

      const idx = current_history_idx !== history.length - 1 ? (current_history_idx >= 0 ? current_history_idx + 1 : -1) : current_history_idx

      dispatch({
        type: Constants.REVERT,
        idx: idx
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
      const { history, current_history_idx } = getState().world

      dispatch({
        type: Constants.SET_STATUS,
        status: STATUS.LOADING
      })
      return SEMPREquery({ q: ['q', q, '{}'], sessionId: sessionId })
      .then((response) => {
        const candidates = response.candidates
        /* Remove no-ops */
        const idx = current_history_idx >= 0 && current_history_idx < history.length ? current_history_idx : history.length - 1
        const currentValue = history[idx].value
        const responses = candidates.filter((a) => {
          return a.value!==currentValue
        })
        dispatch(Logger.log({ type: "try", msg: { query: q, responses: responses.length } }))
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

  pushToHistory: (el) => {
    return (dispatch) => {
      dispatch({
        type: Constants.ACCEPT,
        el: el
      })
    }
  },

  accept: (text, spec) => {
    return (dispatch, getState) => {
      const { sessionId } = getState().user
      const { responses } = getState().world

      const selected = spec

      if (selected.error) {
        alert("You can't accept a response with an error in it. Please accept another response or try a different query.")
        dispatch({
          type: Constants.SET_STATUS,
          status: STATUS.TRY
        })
        return
      }

      const query = ['accept', {utterance: text, context:spec, targetValue:spec }]
      SEMPREquery({ q: query, sessionId: sessionId }, () => { })

      dispatch({
        type: Constants.ACCEPT,
        el: { ...selected, text }
      })

      return true
    }
  },

  revert: (idx) => {
    return (dispatch) => {
      dispatch(Logger.log({ type: "revert", msg: { idx: idx } }))

      dispatch({
        type: Constants.REVERT,
        idx: idx
      })
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
