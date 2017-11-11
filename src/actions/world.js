import { SEMPREquery } from "helpers/sempre"
import dsUtils from 'helpers/dataset-utils'
// import { persistStore } from "redux-persist"
// import { getStore } from "../"
import { STATUS } from "constants/strings"
import {prettyStringify, parseWithErrors} from '../helpers/vega-utils';
import Constants from 'actions/constants'

import {fakeResponsesFromSchema} from 'helpers/vega-utils'

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
      const { context, schema } = getState().world

      const serverRecommendation = true
      if (!serverRecommendation) {
        let fakeCandidates = fakeResponsesFromSchema(schema);
        console.log(fakeCandidates[0]);
        dispatch({
          type: Constants.SET_RESPONSES,
          responses: fakeCandidates
        })
        return true
      }

      SEMPREquery({q: ['random', {amount: 20, context, schema}], sessionId: sessionId})
      .then((response) => {
        console.log(response.candidates[0]);
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
      const { context, query, schema } = getState().world
      // if ('initialContext' in context) {
      //   window.alert('you need a starting plot before issuing a command');
      //   return
      // }
      dispatch({
        type: Constants.SET_STATUS,
        status: STATUS.LOADING
      })

      return SEMPREquery({ q: ['q', {utterance: q, context, schema}], sessionId: sessionId })
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

      const routing = getState().routing
      const location = routing.location || routing.locationBeforeTransitions
      const datasetURL = location.query.dataset
      if (datasetURL === undefined) {
        dispatch(Actions.getRandom())
      } else {
        dsUtils.loadURL(datasetURL)
          .then(loaded => {
            const parsed = dsUtils.parseRaw(loaded.data),
             values = parsed.values,
             schema = dsUtils.schema(values)
            dispatch(Actions.setState({schema: schema, dataValues: values}))
            dispatch(Actions.getRandom())
          })
          .catch(function(err) {
            console.log(err)
          });
      }
      // persistStore(getStore(), { whitelist: ['world', 'user'] }, () => { }).purge()
    }
  }
}

export default Actions
