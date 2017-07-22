import { SEMPRE_SERVER_URL } from "constants/strings"

export function SEMPREquery(cmds, callback) {
  const cmdstr = []
  for (const k in cmds) {
    if ({}.hasOwnProperty.call(cmds, k)) {
      cmdstr.push(`${k}=${encodeURIComponent(JSON.stringify(cmds[k]))}`)
    }
  }

  return fetch(`${SEMPRE_SERVER_URL}/sempre?${cmdstr.join("&")}`)
    .then((response) => {
      return response.json()
    })
    .catch((ex) => {
      console.log("fetch issue?", ex)
    })
}
