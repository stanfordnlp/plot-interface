var mturk = {};
(function(m) {
  var upper = 5;
  m.check = function(inc){
    var sid = args['sid'];
    if (sid === null) return;
    var previous = window.sessionStorage.getItem(sid);
    var current = 0;
    if (previous != null) {
        current = parseInt(previous);
    }
    current = current + inc;
    window.sessionStorage.setItem(sid, current);
    var text = 'number of labels provided: ' + current + '/' + upper;
    $('#mturk-status').text(text);
    if (current >= upper) {
      $('#mturk-status').text(text + '. task complete, you can submit now!');
    }
  }
})(mturk)
