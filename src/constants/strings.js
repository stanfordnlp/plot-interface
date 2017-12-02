/* Server URLs */
const DEFAULT_SEMPRE_SERVER_URL = "http://jonsson.stanford.edu:8405"
export const SEMPRE_SERVER_URL = process.env.REACT_APP_SEMPRE_SERVER ? process.env.REACT_APP_SEMPRE_SERVER : DEFAULT_SEMPRE_SERVER_URL

/* Header URLs */
/* Meta information */
export const DEFAULT_SESSIONID = "deadbeef"

/* Control strings */
export const STATUS = {
  TRY: "ENTER",
  RENDERING: "RENDERING",
  LOADING: "LOADING",
}
