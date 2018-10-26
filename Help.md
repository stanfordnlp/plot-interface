# Help

This interface translates naturalized commands to actions in the [VegaLite] data visualization language.
To use this tool, **type a command** like `remove ticks`, `change x label to XYZ`, `move the axis label down` and press enter.
Use **select an example** to try another example (from [VegaLite Examples]).

If you are happy with the result, click **Use**, which then set that modification as the Current Example, and you can proceed with further modifications.

## Example commands

### Simple Bar Chart

* make bar narrow
* bars should be hollow
* put XYZ as the plot title
* add a title to the plot
* more horizontal grids
* remove x label
* remove x axis ticks
* remove both axis ticks
* make y label giant
* move legend to the bottom

### Stacked Bar Chart (has legend)
* remove entire legend
* remove legend label
* put a red box around the legend
* add more space between plot and legend
* move legend to the top

## Tips

If you are familiar with VegaLite or willing to read [VegaLite Docs], you can use the **Filters** to help retrieve the desired action. There are two filters: `value type` and `VegaLite keywords`. If you select a type, then only modifications of that type e.g. `number` are be returned. If you select a few keywords, which are the same keywords that appear in the VegaLite specification, then only modifications containing those keywords are returned. e.g. `title`, `axisX`.

### Caveats

* If you want to change a string, use `XYZ` (which is in the training set).
* red, green, blue are the only allowed colors

## Technical
* Only support plot formatting operations, which does not include data processing and significant changes of the visualization type
* Does not support direct operations on composed plots (layered, faceted, etc.)


[VegaLite]: https://vega.github.io/vega-lite/
[VegaLite Examples]: https://vega.github.io/vega-lite/examples/.
[VegaLite Docs]: https://vega.github.io/vega-lite/docs/
