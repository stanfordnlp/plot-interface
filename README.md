# plot-interface

Web interface for the plotting project

## Running locally

AJAX usually does not work with the `file://` protocol, so you need to start a simple HTTP server.

* Clone the repository
* Get example datasets
    ```
    svn checkout https://github.com/vega/vega-editor/trunk/data
    ```
* Inside the root directory, run

    ```
    python -m SimpleHTTPServer 8000
    ```

    Change `8000` to some other port number as needed
* Navigate to [`http://localhost:8000`](http://localhost:8000) (Note `http`, not `https`)
* To query a local server instead of our default server, use [`http://localhost:8000/?host=localhost`](http://localhost:8000/?host=localhost)
* Try utterances such as _"new car"_ and _"background red"_

## Turking guide

* require ?uid=workerId&sid=assignmentId

* sid is used to retrieve session storage, and expected to be unique.
