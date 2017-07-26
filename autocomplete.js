$(function() {

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

});

var availableTags = [
 'symbol',
 'gradient',
 'json',
 'csv',
 'tsv',
 'topojson',
 'rgb',
 'lab',
 'hcl',
 'hsl',
 'hsl-long',
 'hcl-long',
 'cubehelix',
 'cubehelix-long',
 'top',
 'middle',
 'bottom',
 'area',
 'bar',
 'line',
 'point',
 'text',
 'tick',
 'rect',
 'rule',
 'circle',
 'square',
 'quantitative',
 'ordinal',
 'temporal',
 'nominal',
 'radio',
 'linear',
 'linear-closed',
 'step',
 'step-before',
 'step-after',
 'basis',
 'basis-open',
 'basis-closed',
 'cardinal',
 'cardinal-open',
 'cardinal-closed',
 'bundle',
 'monotone',
 'zero',
 'center',
 'normalize',
 'none',
 'linear',
 'bin-linear',
 'log',
 'pow',
 'sqrt',
 'time',
 'utc',
 'sequential',
 'ordinal',
 'bin-ordinal',
 'point',
 'band',
 'line',
 'linepoint',
 'none',
 'checkbox',
 'single',
 'multi',
 'interval',
 'normal',
 'italic',
 'error-bar',
 'row',
 'column',
 'independent',
 'shared',
 'argmax',
 'argmin',
 'average',
 'count',
 'distinct',
 'max',
 'mean',
 'median',
 'min',
 'missing',
 'modeskew',
 'q1',
 'q3',
 'ci0',
 'ci1',
 'stdev',
 'stdevp',
 'sum',
 'valid',
 'values',
 'variance',
 'variancep',
 'range',
 'select',
 'top',
 'right',
 'left',
 'bottom',
 'box-plot',
 'normal',
 'bold',
 'year',
 'month',
 'day',
 'date',
 'hours',
 'minutes',
 'seconds',
 'milliseconds',
 'yearmonth',
 'yearmonthdate',
 'yearmonthdatehours',
 'yearmonthdatehoursminutes',
 'yearmonthdatehoursminutesseconds',
 'monthdate',
 'hoursminutes',
 'hoursminutesseconds',
 'minutesseconds',
 'secondsmilliseconds',
 'quarter',
 'yearquarter',
 'quartermonth',
 'yearquartermonth',
 'utcyear',
 'utcmonth',
 'utcday',
 'utcdate',
 'utchours',
 'utcminutes',
 'utcseconds',
 'utcmilliseconds',
 'utcyearmonth',
 'utcyearmonthdate',
 'utcyearmonthdatehours',
 'utcyearmonthdatehoursminutes',
 'utcyearmonthdatehoursminutesseconds',
 'utcmonthdate',
 'utchoursminutes',
 'utchoursminutesseconds',
 'utcminutesseconds',
 'utcsecondsmilliseconds',
 'utcquarter',
 'utcyearquarter',
 'utcquartermonth',
 'utcyearquartermonth',
 'global',
 'independent',
 'union',
 'union_others',
 'intersect',
 'intersect_others',
 'left',
 'right',
 'center',
 'horizontal',
 'vertical',
];
