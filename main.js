var editor;

$(function () {

  // ################################
  // ACE stuff

  editor = ace.edit("editor");
  editor.getSession().setMode("ace/mode/json");
  
  // Undo / Redo
  editor.on('input', function () {
    var um = editor.getSession().getUndoManager();
    $('#undo-button').attr('disabled', !um.hasUndo());
    $('#redo-button').attr('disabled', !um.hasRedo());
  });

  $('#undo-button').click(function () { editor.undo(); });
  $('#redo-button').click(function () { editor.redo(); });

  // ################################
  // Input box and Autocomplete

  $("#command-box").on("keydown", function(event) {
    // don't navigate away from the field on tab when selecting an item
    if (event.keyCode === $.ui.keyCode.TAB &&
          $(this).autocomplete("instance").menu.active) {
      event.preventDefault();
    }
  }).on("keyup", function (event) {
    if (event.keyCode === $.ui.keyCode.ENTER) {
      $('#command-box').autocomplete('close');
      return false;
    }
  }).autocomplete({
    minLength: 0,
    source: function(request, response) {
      if (request.term == '' || request.term.endsWith(' ')) {
        response([]);
      } else {
        var lastWord = request.term.split(' ').pop();
        var matcher = new RegExp("^" + $.ui.autocomplete.escapeRegex(lastWord), "i");
        response(availableTags.filter(function (x) {
          return matcher.test(x);
        }));
      }
    },
    focus: function() {
      // prevent value inserted on focus
      return false;
    },
    select: function(event, ui) {
      var terms = this.value.split(' ');
      // remove the last fragment
      terms.pop();
      // add the selected item
      terms.push(ui.item.value);
      this.value = terms.join(" ");
      return false;
    }
  });

  // Ctrl+M to focus
  $(document).keyup(function (event) {
    if ((event.ctrlKey || event.metaKey) && (event.which == 77 || event.which == 109)) {
      $('#command-box').focus();
    }
  });

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

  function parseVega(spec, visDiv, errDiv, successCallback) {
    if (typeof spec === 'string' && !spec.startsWith('{')) {
      $(errDiv).text('ERROR: Invalid spec ' + spec).addClass('fatal');
      return;
    }
    vega.embed(visDiv, spec, opt, function(error, result) {
      if (error != null) {
        $(errDiv).text('ERROR while rendering: ' + error).addClass('fatal');
      } else {
        $(errDiv).text('DONE rendering.').removeClass('fatal');
        if (successCallback !== undefined) successCallback();
      }
    });
  }

  function parseVegaFromAce() {
    try {
      parseVega(JSON.parse(editor.getValue()), '#vis', '#err');
    } catch (error) {
      $('#err').text('ERROR while parsing JSON: ' + error).addClass('fatal');
    }
  }
  $('#parse-button').click(parseVegaFromAce);
  editor.commands.addCommand({
      exec: parseVegaFromAce,
      bindKey: {win: "ctrl-enter", mac: "cmd-enter"}
  });

  // ################################
  // Semantic parsing

  function parseQueryString() {
      var str = window.location.search;
      var objURL = {};

      str.replace(
          new RegExp( "([^?=&]+)(=([^&]*))?", "g" ),
          function( $0, $1, $2, $3 ){
              objURL[ $1 ] = $3.replace(/\/$/, "");
          }
      );
      return objURL;
  };
  var args = parseQueryString();
  if ('host' in args) {
    var url = 'http://' + args['host'] + ':8405';
  } else if ('local' in args) {
    var url = 'http://localhost:8405';
  } else {
    var url = 'http://jonsson.stanford.edu:8405';
  }

  function parseNL() {
    try {
      var nl = $('#command-box').val();
      var spec = JSON.parse(editor.getValue());

      $.get(url+'/sempre?q=' + encodeURIComponent(JSON.stringify(['context', spec])),
          function (result) {
            $.get(url+'/sempre?q=' + encodeURIComponent(JSON.stringify(['q', nl])),
              function (result) {
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

  var CANDIDATES_PER_PAGE = 10;

  // Candidate drawing
  function drawCandidates(candidates) {
    // Filter out errors from server
    candidates = candidates.filter(function(x) { 
      return !(typeof x.value == 'string' && x.value.indexOf("BADJAVA") == 0);
    })
    if (candidates.length === 0) {
      $('#display-candidates').empty().append($('<div class=num-results>')
          .text('No results.'));
      return;
    }

    var pages = [], currentPageId = -1,
        numPages = Math.ceil(candidates.length / CANDIDATES_PER_PAGE);
    $('#display-candidates').empty();
    var numResultsDiv = $('<div class=num-results>').appendTo('#display-candidates');
    var resultsDiv = $('<div>').appendTo('#display-candidates');
    var paginateFooter = $('<div class=paginate-footer>').appendTo('#display-candidates');
    var numPagesDiv = $('<div>').appendTo(paginateFooter);
    var pageLinks = $('<div>').appendTo(paginateFooter);
    for (var i = 0; i < numPages; i++) {
      // Closure :(
      (function (i) {
        $('<span class=paginate-link>').text(i + 1).appendTo(pageLinks)
          .click(function () {
            drawPaginatedCandidates(i);
          });
      })(i);
    }

    function drawPaginatedCandidates(pageId) {
      if (currentPageId == pageId) return;
      var start = pageId * CANDIDATES_PER_PAGE;
      var end = Math.min(start + CANDIDATES_PER_PAGE, candidates.length);
      if (!pages[pageId]) {
        var page = $('<div class=results-page>').appendTo(resultsDiv);
        for (var i = start; i < end; i++) {
          // Closure :(
          (function (i) {
            var candidate = candidates[i];
            var candidateDiv = $('<div class=candidate-div>').appendTo(page);
            var candidateLf = $('<div class=candidate-lf>').appendTo(candidateDiv)
              .text(candidate.formula);
            var candidateErr = $('<div class=candidate-err>').appendTo(candidateDiv);
            var candidateVis = $('<div class=candidate-vis>').appendTo(candidateDiv);
            parseVega(candidate.value, candidateVis[0], candidateErr[0], function () {
              if (candidateVis.children().eq(0).height() == 0) {
                candidateErr.text('ERROR: Nothing is rendered').addClass('fatal');
                return;
              }
              $('<button>').text('USE').appendTo(candidateDiv)
                .click(function () {
                  pages = [];     // Throw all rendered pages away
                  $('#display-candidates').empty();
                  editor.setValue(JSON.stringify(candidate.value, null, '  '), -1);
                  parseVegaFromAce();
                  $('#command-box').val('');
                })
            });
          })(i);
        }
        pages[pageId] = page;
      }
      resultsDiv.children().hide();
      pages[pageId].show();
      numResultsDiv.text('Showing ' + (start+1) + '-' + (end) + ' of ' + candidates.length);
      numPagesDiv.text('Page ' + (pageId+1) + ' of ' + numPages);
      pageLinks.children().addClass('clickable').eq(pageId).removeClass('clickable');
      $('#display-candidates').scrollTop(0);
      currentPageId = pageId;
    }
    drawPaginatedCandidates(0);
  }


  // ################################
  // Initialize
  editor.setValue(JSON.stringify(vlSpec, null, '  '), -1);
  parseVegaFromAce();


});
