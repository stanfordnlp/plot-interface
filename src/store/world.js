import Constants from 'actions/constants'
import { STATUS } from "constants/strings"
// import specs from "constants/specs"
import {prettyStringify} from "helpers/vega-utils"
// must have key initialContext
const emptyContext = {'initialContext': 'no current plot, pick an example'};
const initialState = {
  context: emptyContext,
  editorString: prettyStringify(emptyContext),
  responses: [],
  status: STATUS.TRY,
  query: "",
  issuedQuery: "",
  contextHash: "this value should not show up, and should be overriden on init",
  showErrors: false,
  showFormulas: false
}

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case Constants.SET_QUERY:
      return { ...state, query: action.query }
    case Constants.TRY_QUERY:
      return { ...state, responses: action.responses}
    case Constants.ACCEPT:
      return { ...state, context: action.target, responses: [], status: STATUS.TRY }
    case Constants.SET_STATUS:
      return { ...state, status: action.status }
    case Constants.SET_CONTEXT_HASH:
      return { ...state, contextHash: action.contextHash }
    case Constants.SET_SHOW_ERRORS:
      return { ...state, showErrors: action.showErrors }
    case Constants.SET_SHOW_FORMULAS:
      return { ...state, showFormulas: action.showFormulas }
    case Constants.SET_EDITOR_STRING:
      return { ...state, editorString: action.editorString }
    case Constants.SET_RESPONSES:
      return { ...state, responses: action.responses }
    case Constants.SET_ISSUED_QUERY:
      return { ...state, issuedQuery: action.issuedQuery }
    case Constants.CLEAR:
      return initialState
    default:
      return state
  }
}
