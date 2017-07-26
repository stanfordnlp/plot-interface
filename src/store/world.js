import Constants from "constants/actions"
import { STATUS } from "constants/strings"
import specs from "constants/specs"

const initialState = {
  context: specs,
  responses: [],
  status: STATUS.TRY,
  query: "",
}

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case Constants.SET_QUERY:
      return { ...state, query: action.query }
    case Constants.TRY_QUERY:
      return { ...state, responses: action.responses, status: STATUS.RENDERING }
    case Constants.ACCEPT:
      return { ...state, context: action.target, responses: [], status: STATUS.TRY, query: "" }
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
