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
* Try utterances such as _"new"_ and _"change mark to line"_
