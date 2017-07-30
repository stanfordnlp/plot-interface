# plot-interface

user interface for plotting with semantic parsing

## Running locally

* Clone the repository

* install yarn and run `yarn install`

* start client that queries the local server: `yarn start:local`

* start client that queries the public server `yarn start`

* push a version to the public url: `yarn run build && yarn run deploy`

## Turking

* send turking parameters through url parameters: `BASE_URL/?uid=workerId&sid=assignmentId`

* this should be logged in the server at `SEMPRE_ROOT/plot-out/query.jsonl` by default
check that the parameters are loaded correctly!

## Picking examples

* data for vegalite and example specifications are in `public`

* `public/spec/vega-lite/index.json` together with `src/helper/vega-utils.responsesFromExamples` determines which examples get displayed in the beginning.
