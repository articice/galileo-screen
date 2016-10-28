# galileo-screen

usage example

```
var screen = require('galileo-screen');

response = screen.wrapLines(response); //if your output is not wrapped, try A20NOVIEVCPH (availability screen)

if (previous_response) {
    response = screen.mergeResponse(previous_response, response);
}

if (screen.hasMore(response)) {
    //execute next MD somehow
} else {
    callback(null, response);
}
```
