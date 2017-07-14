/** Insert a slider for visualizing image differences.
  Args:
    controlDiv (JQuery Object): div to insert control slider
    baseCanvas (JQuery Object): canvas showing the base image
    anotherCanvas (JQuery Object): canvas containing the image to be overlaid
*/
function diffSlider(controlDiv, baseCanvas, anotherCanvas) {
  // The overlaying canvas
  var overlaidCanvas;
  // Add slider
  controlDiv.addClass('diff-slider-wrap').append('Compare: ');
  var slider = $('<input type=range min=0 max=1 step=0.01 value=0>')
    .appendTo(controlDiv)
    .on('input', function() {
      var value = slider.val();
      if (value > 0 && overlaidCanvas === undefined) {
        // Get information about the baseCanvas
        var baseWidth = baseCanvas.prop('width'),
            baseHeight = baseCanvas.prop('height');
        // Create an image overlay
        overlaidCanvas = $('<canvas>')
          .prop({width: baseWidth, height: baseHeight})
          .addClass('diff-slider-overlay')
          .appendTo(baseCanvas.parent());
        var ctx = overlaidCanvas[0].getContext('2d');
        ctx.drawImage(anotherCanvas[0], 0, 0);
      }
      overlaidCanvas.css('opacity', value);
    });
  // Quick Diff
  var quickDivCanvas;
  var quickDivButton = $('<button class=diff-slider-quickdiff>')
    .text('Quick diff')
    .appendTo(controlDiv)
    .mousedown(function () {
      if (!quickDivCanvas) {
        // Get information about the baseCanvas
        var baseWidth = baseCanvas.prop('width'),
            baseHeight = baseCanvas.prop('height');
        // Create an image overlay
        quickDivCanvas = $('<canvas>')
          .prop({width: baseWidth, height: baseHeight})
          .addClass('diff-slider-overlay')
          .css('mix-blend-mode', 'difference')
          .appendTo(baseCanvas.parent());
        var ctx = quickDivCanvas[0].getContext('2d');
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, baseWidth, baseHeight);
        ctx.drawImage(anotherCanvas[0], 0, 0);
      }
      quickDivCanvas.show();
    }).mouseup(function() {
      if (quickDivCanvas) quickDivCanvas.hide();
    });
}
