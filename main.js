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

  function parseNL() {
    try {
      var nl = $('#command-box').val();
      var spec = JSON.parse(editor.getValue());
      // ################################################
      // TODO: Change this to the real thing
      var spec1 = JSON.parse(editor.getValue());
      spec1.mark = 'point';
      var spec2 = JSON.parse(editor.getValue());
      spec2.mark = 'line';
      var spec3 = JSON.parse(editor.getValue());
      spec3.mark = 'square';
      var spec4 = JSON.parse(editor.getValue());
      spec4.mark = 'bar';
      var candidates = [
        {
          'spec': spec1,
          'rep': 'CHANGE mark TO "point"'
        },
        {
          'spec': spec2,
          'rep': 'CHANGE mark TO "line"'
        },
        {
          'spec': spec3,
          'rep': 'CHANGE mark TO "square"'
        },
        {
          'spec': spec4,
          'rep': 'CHANGE mark TO "bar"'
        },
      ];
      drawCandidates(candidates);
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
    candidates.forEach(function (candidate) {
      var candidateDiv = $('<div class=candidate-div>')
        .appendTo('#display-candidates');
      var candidateRep = $('<div class=candidate-rep>')
        .appendTo(candidateDiv).text(candidate.rep);
      var candidateVis = $('<div class=candidate-vis>')
        .appendTo(candidateDiv);
      var candidateErr = $('<div class=candidate-err>')
        .appendTo(candidateDiv);
      parseVega(candidate.spec, candidateVis[0], candidateErr[0]);
      var candidateUse = $('<button>').text('USE')
        .appendTo(candidateDiv)
        .click(function () {
          $('#display-candidates').empty();
          editor.setValue(JSON.stringify(candidate.spec, null, '  '), -1);
          parseVegaFromAce();
        });
    });
  }

  // Candidate selection


  // ################################
  // Initialize
  editor.setValue(JSON.stringify(vlSpec, null, '  '), -1);
  parseVegaFromAce();


});
