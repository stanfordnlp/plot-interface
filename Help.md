# Help

This interface translates naturalized commands to actions in the [Vega-Lite] data visualization language.
To use this tool, **type a command** like `remove ticks`, `change x label to XYZ`, `move the axis label down` and press enter.
Use **select an example** to try another example (from [Vega-Lite Examples]).

## Get started

The *current plot* always displayed at the top left.
This tool modifies the **Current plot** based on naturalized commands,
which can be typed into the input at the top. For example,

* remove ticks
* change x label to "XYZ"
* move the axis label down
* bar red
* y label font size 25

Type a command and press enter to retrieve candidate modifications.
If you like a candidate, click **Use**, to set the candidate as the Current plot.
Alternatively, click **Refine** to compare and edit the plot before deciding to use.

Use **Select an example** to try another example from [Vega-Lite Examples] or use **Import spec** to try your own spec.

Currently, this tool can only perform *plot formatting* operations, which means the data is never modified,
and it does not make significant change to the type of plot.

## Example commands

### Example: Simple Bar Chart
* y label font size 25
* put "something" as the plot title
* more horizontal grids
* move x label down by 50
* remove x axis ticks
* remove x label
* make grid darkblue
* add vertical grid
* remove x axis ticks
* remove both axis ticks
* make y label giant
* make bar narrow
* add a title to the plot
* bars should be hollow

### Example: Stacked Bar Chart (has legend)
* remove entire legend
* remove legend label
* put a red box around the legend
* add more space between plot and legend
* move legend to the top
* move legend to the bottom

## Tips

* Put double quotes around "string values"
* Supports [CSS colors], and hex colors like `#ff0` or `#ffff00`

### Filters
If you are familiar with Vega-Lite or willing to read [Vega-Lite Docs], you can use the **Filters** to help retrieve the desired action. There are two filters: `value type` and `Vega-Lite keywords`. If you select a type, then only modifications of that type e.g. `number` are be returned. If you select a few keywords, which are the same keywords that appear in the Vega-Lite specification, then only modifications containing those keywords are returned. e.g. `title`, `axisX`.

### Display modes

In text mode, the text descriptions and the Vega-Lite formulas are displayed. In text mode, more candidates are displayed.

In graphics mode, the top 5 candidates are displayed graphically.

## Technical

* Only support plot formatting operations, which does not include data processing and significant changes of the visualization type

* Does not support direct operations on composed plots (layered, faceted, etc.)

Any fields containing the following are not modified: `$schema`,
    `vconcat`, `hconcat`, `layer`, `spec`, `repeat`, `facet`,
    `condition`, `selection`, `cursor`, `tooltip`,
    `transform`, `data`,
    `impute`, `aggregate`, `bin`,
    `geoshape`, `geojson`, `latitute`, `longitute`,
    `timeUnit`

[Vega-Lite]: https://vega.github.io/vega-lite/
[Vega-Lite Examples]: https://vega.github.io/vega-lite/examples/.
[Vega-Lite Docs]: https://vega.github.io/vega-lite/docs/
[CSS Colors]: https://www.w3schools.com/cssref/css_colors.asp
