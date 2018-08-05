import { getStore, setStore, genUid } from "helpers/util"
import Constants from 'actions/constants'

const Actions = {
  setSessionId: (uidParam) => {
    return (dispatch, getState) => {

      let sessionId = ""
      /* We get the UID param from the routing reducer */
      if (uidParam) {
        sessionId = uidParam
      } else {
        let uid = getStore("uid")
        if (!uid) {
          uid = genUid()
          setStore("uid", uid)
        }
        sessionId = uid
      }
      console.log('setSessionId', sessionId)
      dispatch({
        type: Constants.SET_SESSION_ID,
        sessionId: sessionId
      })
    }
  },

  setTask: (task) => {
    return (dispatch) => {
      dispatch({
        type: Constants.SET_TASK,
        task
      })
    }
  },

  increaseCount: (count) => {
    return (dispatch) => {
      dispatch({
        type: Constants.INCREASE_COUNT,
        count: count
      })
    }
  }
}

export default Actions
