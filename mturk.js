var mturk = {};
(function(m) {
  var upper = 10;
  m.check = function(inc){
    var sid = args['sid'];
    var previous = window.sessionStorage.getItem(sid);
    var current = 0;
    if (! previous === null) {
        current = parseInt(previous);
    }
    current = current + inc;
    window.sessionStorage.setItem(sid, current);
    var text = 'number of labels provided: ' + current + '/' + upper;
    $('#mturk-status').text(text);
    if (current >= 10) {
      $('#mturk-status').text(text + '. task complete, submit your hit and get a new assignment.');
    }
  }
})(mturk)
