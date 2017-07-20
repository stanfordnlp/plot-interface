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
  // Display data table

  var lastDataSource = null, MAX_TABLE_RECORDS = 20;

  function clearTable() {
    $('#table-wrapper').empty();
    $('#table-title').empty().append(
        '<strong>Data</strong> No data loaded');
  }

  // Read JSON data and draw the table
  function displayTableFromData(data) {
    $('#table-wrapper').empty();
    var table = $('<table>').appendTo('#table-wrapper');
    var keys = Object.keys(data[0]);
    keys.sort();
    keys.forEach(function (key) {
      if (key == '_id') return;
      var row = $('<tr>').appendTo(table);
      $('<th>').text(key).attr('title', key).appendTo(row)
        .click(function () {
          $('#command-box').val(($('#command-box').val().trim() + ' ' + key).trim());
        });
      data.slice(0, MAX_TABLE_RECORDS).forEach(function (datum, i) {
        $('<td>').text(datum[key]).attr('title', datum[key]).appendTo(row);
      });
    });
    $('#table-title').empty().append(
        '<strong>Data</strong> Showing 1-' +
        Math.min(MAX_TABLE_RECORDS, data.length) + 
        ' out of ' + data.length + ' records<br>' +
        '<span class=small>Click on a field name to use it in the query</span>');
  }

  // Read the spec, grab the data, and call displayTableFromData if needed
  function displayTableFromSpec(spec) {
    if (spec.data && spec.data.values) {
      // If local data is used, always draw a table
      displayTableFromData(spec.data.values);
      lastDataSource = null;
    } else if (spec.data && spec.data.url) {
      // If the URL was not changed, do not redraw
      var url = spec.data.url;
      if (url == lastDataSource) return;
      if (url.endsWith('.csv'))
        d3.csv(url, displayTableFromData);
      else if (url.endsWith('.tsv'))
        d3.tsv(url, displayTableFromData);
      else
        d3.json(url, displayTableFromData);
      lastDataSource = spec.data.url;
    } else {
      clearTable();
      lastDataSource = null;
    }
  }

  // ################################
  // Vega stuff

  var vegaOpt = {
    "mode": "vega-lite",
    "actions": false,
  };

  /** Use Vega-Lite to generate graph
    Args:
      spec (string or object): Vega-Lite JSON spec
      visDiv (DOM Element or JQuery Object): container for the graph
      errDiv (DOM Element or JQuery Object): container for the error message
          (or success message)
      onFulfilled (function; optional): a function taking a Vega View instance;
          will be called when rendering succeeds
      onRejected (function; optional): a function taking an exception;
          will be called when rendering fails
    */
  function parseVega(spec, visDiv, errDiv, onFulfilled, onRejected) {
    if (typeof spec === 'string') {
      try {
        spec = JSON.parse(spec);
      } catch (err) {
        $(errDiv).text('ERROR: Invalid spec ' + spec).addClass('fatal');
        if (onRejected !== undefined) onRejected(err);
        return;
      }
    }
    vega.embed(visDiv, spec, vegaOpt).then(
      // Success
      function (value) {
        $(errDiv).text('DONE rendering.').removeClass('fatal');
        if (onFulfilled !== undefined) onFulfilled(value);
      },
      // Failure
      function (reason) {
        $(errDiv).text('ERROR while rendering: ' + reason.message).addClass('fatal');
        if (onRejected !== undefined) onRejected(reason);
      });
  }

  // call parseVega and displayTableFromSpec on the editor content
  function parseVegaFromAce() {
    try {
      var spec = JSON.parse(editor.getValue());
      parseVega(spec, '#vis', '#err');
      displayTableFromSpec(spec);
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
  // Set the server location
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

      /* Single request version ...
      var data = {
        'q': JSON.stringify(['q', nl, spec]),
      }
      $.post(url+'/sempre', data, function (result) {
        drawCandidates(result.candidates);
      });
      */
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

  // ################################
  // Collecting user utterances

  function collectUserUtterances(candidate) {
    var collectionDiv = $('#utterance-collection-modal');

    $('<div id=utterance-collection-prompt>')
      .text('Please describe the change you are making.')
      .appendTo(collectionDiv);

    buildCandidateDiv(candidate).appendTo(collectionDiv);

    // add input boxes
    var numUtterances = 1;
    var utteranceInputs = [];
    for (var i = 0; i < numUtterances; i++) {
      var utteranceInput = $('<input type=text class=utterance>').appendTo(collectionDiv);
      utteranceInput.attr("placeholder", 'Description #' + (i + 1));
      utteranceInputs.push(utteranceInput);
    }

    var closeCallback = function () {
      collectionDiv.css("display", "none");
      collectionDiv.empty();
    };

    // Button to submit
    var submitButton = $('<button>').text('SUBMIT').appendTo(collectionDiv);
    submitButton.click(function () {
      var utterances = utteranceInputs.map(function(input) {return input.val();});
      // TODO: check that utterances are valid, complete

      utterances.forEach(function(utter) {
        var data = {
          // TODO: where to get targetValue and context?
          // Is this right?
          // var context = JSON.parse(editor.getValue());
          'q': JSON.stringify(['accept', {"utterance": utter, "targetValue": null, "context": null}])
        };
        $.post(url+'/sempre', data, function () {
          console.log("Data uploaded to server.")
        });
      });

      collectionDiv.css("display", "none");
      collectionDiv.empty();

    // Button to cancel
    var cancelButton = $('<button>').text('CANCEL').appendTo(collectionDiv);
    cancelButton.click(function () {
      closeCallback();
    });

    collectionDiv.css("display", "flex");
  }

  // ################################
  // Candidate drawing

  var CANDIDATES_PER_PAGE = 10;

  function buildCandidateDiv(candidate) {
    var candidateDiv = $('<div class=candidate-div>');
    var candidateLf = $('<div class=candidate-lf>').appendTo(candidateDiv)
      .text(candidate.formula);
    var candidateErr = $('<div class=candidate-err>').appendTo(candidateDiv);
    var candidateVis = $('<div class=candidate-vis>').appendTo(candidateDiv);
    parseVega(JSON.stringify(candidate.value),
      candidateVis[0], candidateErr[0], function () {
        if (candidateVis.children('canvas').height() == 0) {
          candidateErr.text('ERROR: Nothing is rendered').addClass('fatal');
          return;
        }
        // Image diff slider
        diffSlider(
          $('<div>').appendTo(candidateDiv),
          candidateVis.children('canvas'),
          $('#vis > canvas')
        );
      });
    return candidateDiv;
  }

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

    // Divide results into pages; draw the pages lazily
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
    
    // Function for drawing a page
    function drawPaginatedCandidates(pageId) {
      if (currentPageId == pageId) return;
      var start = pageId * CANDIDATES_PER_PAGE;
      var end = Math.min(start + CANDIDATES_PER_PAGE, candidates.length);
      if (!pages[pageId]) {
        // If we haven't drawn the page yet, draw it
        var page = $('<div class=results-page>').appendTo(resultsDiv);
        for (var i = start; i < end; i++) {
          // Closure :(
          (function (i) {
            var candidate = candidates[i];
            candidateDiv = buildCandidateDiv(candidate);

            $('<button>').text('LABEL').appendTo(candidateDiv)
              .click(function () {
                collectUserUtterances(candidate);
              });

            $('<button>').text('USE').appendTo(candidateDiv)
              .click(function () {
                pages = [];     // Throw all rendered pages away
                $('#display-candidates').empty();
                editor.setValue(JSON.stringify(candidate.value, null, '  '), -1);
                parseVegaFromAce();
                $('#command-box').val('');
              });

            candidateDiv.appendTo(page);
          })(i);
        }
        pages[pageId] = page;
      }
      // Show the page
      resultsDiv.children().hide();
      pages[pageId].show();
      numResultsDiv.text('Showing ' + (start+1) + '-' + (end) + ' of ' + candidates.length);
      numPagesDiv.text('Page ' + (pageId+1) + ' of ' + numPages);
      pageLinks.children().addClass('clickable').eq(pageId).removeClass('clickable');
      $('#display-candidates').animate({scrollTop: 0}, 600);
      currentPageId = pageId;
    }

    // Finally, draw page 0
    drawPaginatedCandidates(0);
  }


  // ################################
  // Initialize

  // Initial spec
  var initialSpec = {
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

  editor.setValue(JSON.stringify(initialSpec, null, '  '), -1);
  parseVegaFromAce();

});
