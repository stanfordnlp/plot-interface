import { SEMPRE_SERVER_URL } from "constants/strings"

export function SEMPREquery(cmds, callback) {
  const cmdstr = []
  for (const k in cmds) {
    if ({}.hasOwnProperty.call(cmds, k)) {
      if (k==='q')
        cmdstr.push(`${k}=${encodeURIComponent(JSON.stringify(cmds[k]))}`)
      else cmdstr.push(`${k}=${encodeURIComponent(cmds[k])}`)
    }
  }

  return fetch(`${SEMPRE_SERVER_URL}/sempre?${cmdstr.join("&")}`)
    .then((response) => {
      return response.json()
    })
    .catch((ex) => {
      console.log(`Exception when querying`, SEMPRE_SERVER_URL, cmdstr, ex)
    })
}
