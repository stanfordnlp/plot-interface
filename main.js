$(function () {

  // ################################
  // ACE stuff

  var editor = ace.edit("editor");
  editor.getSession().setMode("ace/mode/json");

  // ################################
  // Vega stuff

  var vlSpec = {
    "data": {
      "values": [
        {"a": "C", "b": 7},
        {"a": "D", "b": 3},
        {"a": "E", "b": 8},
      ]
    },
    "mark": "bar",
    "encoding": {
      "y": {"field": "a", "type": "nominal"},
      "x": {"field": "b", "type": "quantitative"}
    }
  };

  var opt = {
    "mode": "vega-lite",
    "actions": false,
  };

  function parseVega(spec, visDiv, errDiv) {
    vega.embed(visDiv, spec, opt, function(error, result) {
      if (error != null) {
        $(errDiv).text('ERROR while rendering: ' + error);
      } else {
        $(errDiv).text('DONE rendering.');
      }
    });
  }

  function parseVegaFromAce() {
    try {
      parseVega(JSON.parse(editor.getValue()), '#vis', '#err');
    } catch (error) {
      $('#err').text('ERROR while parsing JSON: ' + error);
    }
  }
  $('#parse-button').click(parseVegaFromAce);

  // ################################
  // FAKE semantic parsing

  function parseQueryString() {
      var str = window.location.search;
      var objURL = {};

      str.replace(
          new RegExp( "([^?=&]+)(=([^&]*))?", "g" ),
          function( $0, $1, $2, $3 ){
              objURL[ $1 ] = $3;
          }
      );
      return objURL;
  };
  var local = ('local' in parseQueryString())
  var url = local? 'http://localhost:8405' : 'http://jonsson.stanford.edu:8405';

  function parseNL() {
    try {
      var nl = $('#command-box').val();
      var spec = JSON.parse(editor.getValue());

      $.get(url+'/sempre?q=' + encodeURIComponent(JSON.stringify(['context', spec])), function (result) {
        $.get(url+'/sempre?q=' + encodeURIComponent(JSON.stringify(['q', nl])), function (result) {
          drawCandidates(result.candidates);
        });
      });
    } catch (error) {
      $('#err').text('ERROR while semantic parsing: ' + error);
    }
  }
  $('#submit-button').click(parseNL);
  $('#command-box').keydown(function (e) {
    if (e.keyCode === 13) {
      parseNL();
    }
  });

  // Candidate drawing
  function drawCandidates(candidates) {
    $('#display-candidates').empty();
    $('#display-candidates').append(
      $('<div>').text('' + candidates.length + ' results'));
    candidates.forEach(function (candidate) {
      var candidateDiv = $('<div class=candidate-div>')
        .appendTo('#display-candidates');
      //var candidateRep = $('<div class=candidate-rep>')
      //  .appendTo(candidateDiv).text(candidate.rep);
      var candidateVis = $('<div class=candidate-vis>')
        .appendTo(candidateDiv);
      var candidateErr = $('<div class=candidate-err>')
        .appendTo(candidateDiv);
      parseVega(candidate.formula, candidateVis[0], candidateErr[0]);
      var candidateUse = $('<button>').text('USE')
        .appendTo(candidateDiv)
        .click(function () {
          $('#display-candidates').empty();
          editor.setValue(JSON.stringify(candidate.formula, null, '  '), -1);
          parseVegaFromAce();
          $('#command-box').val('');
        });
    });
  }

  // Candidate selection


  // ################################
  // Initialize
  editor.setValue(JSON.stringify(vlSpec, null, '  '), -1);
  parseVegaFromAce();


});
