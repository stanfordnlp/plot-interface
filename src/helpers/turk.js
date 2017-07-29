import { getParameterByName } from "./util"
import { DEFAULT_SESSIONID } from "constants/strings"

export function getTurkId() {
  const uid = getParameterByName("uid");
  if (uid) return uid;
  return DEFAULT_SESSIONID;
}

export function getTurkCode(targetIdx, nSteps, nBlocks) {
  const uid = getTurkId();
  const encodedData = window.btoa(unescape(encodeURIComponent(`${uid}:win:${targetIdx}:${nSteps}:${nBlocks}:Yummy`)));
  return encodedData;
}
