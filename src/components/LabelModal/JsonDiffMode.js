import * as ace from 'brace';
import 'brace/mode/json';

export default class JsonDiffMode extends ace.acequire('ace/mode/json').Mode {
  // getNextLineIndent(state, line, tab) {
  //   return 0;
  // }
  //
  // checkOutdent(state, line, input) {
  //   return 0;
  // }
  //
  // autoOutdent(state, doc, row) {
  // }

  constructor() {
    super()
    console.log(this)
  }
}
