import Constants from "constants/actions"
import { STATUS } from "constants/strings"
import specs from "constants/specs"

const initialState = {
  history: [{ text: "initial plot", value: specs}],
  responses: [],
  current_history_idx: -1,
  status: STATUS.TRY,
  query: "",
}

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case Constants.SET_QUERY:
      return { ...state, query: action.query }
    case Constants.REVERT:
      return { ...state, current_history_idx: action.idx, responses: initialState.responses, status: initialState.status, query: initialState.query }
    case Constants.TRY_QUERY:
      let history = state.history
      if (state.current_history_idx >= 0) {
        history = history.slice(0, state.current_history_idx + 1)
      }
      return { ...state, responses: action.responses, history: history, current_history_idx: -1, status: STATUS.ACCEPT }
    case Constants.ACCEPT:
      const newHistory = [...state.history, action.el]
      // consider not overriding responses
      return { ...state, history: newHistory, responses: [], status: STATUS.TRY, query: "" }
    case Constants.SET_STATUS:
      return { ...state, status: action.status }
    case Constants.RESET_RESPONSES:
      return { ...state, status: STATUS.TRY, query: "", responses: [] }
    case Constants.CLEAR:
      return initialState
    default:
      return state
  }
}
