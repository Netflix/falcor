
In this barebones tutorial we will use the falcor Router to create a Virtual JSON resource. Then we will use falcor's express middleware to serve the Virtual JSON resource on a application server at the URL /model.json. We will also host a static web page on the same server which retrieves data from the Virtual JSON resource.

## Creating a Virtual JSON Resource

In this example we will use the falcor Router to build a Virtual JSON resource on an app server. The and host it at /model.json. The JSON resource will contain the following contents:

~~~js
{
  "greeting": "Hello World"
}
~~~

Normally Routers retrieve the data for their Virtual JSON resource from backend datastores or other web services on-demand. However in this simple tutorial the Router will simply return static data for a single key.

First we create a folder for our application server.

~~~bash
mkdir falcor-app-server
cd falcor-app-server
npm init
~~~

Now we install the falcor Router.

~~~bash
npm install falcor-router --save
~~~

Then install express and falcor-express.  Support for restify is also available, as is support for hapi via a [third-party implementation](https://github.com/dzannotti/falcor-hapi).

~~~bash
npm install express --save
npm install falcor-express --save
~~~

Now we create an index.js file with the following contents:

~~~js
// index.js
var falcorExpress = require('falcor-express');
var Router = require('falcor-router');

var express = require('express');
var app = express();

app.use('/model.json', falcorExpress.dataSourceRoute(function (req, res) {
  // create a Virtual JSON resource with single key ("greeting")
  return new Router([
    {
      // match a request for the key "greeting"    
      route: "greeting",
      // respond with a PathValue with the value of "Hello World."
      get: function() {
        return {path:["greeting"], value: "Hello World"};
      }
    }
  ]);
}));

// statically host all files in current directory
app.use(express.static(__dirname + '/'));

var server = app.listen(3000);

~~~

Now we run the server, which will listen on port 3000 for requests for /model.json.

~~~sh
node index.js
~~~

## Retrieving Data from the Virtual JSON resource

Now that we've built a simple virtual JSON document with a single read-only key "greeting", we will create a test web page and retrieve this key from the server.

First we build the falcor library from source.

~~~sh
cd ..
git clone https://github.com/Netflix/falcor
cd falcor
npm install
npm run dist
cp dist/falcor.browser.js ../falcor-app-server
cd ../falcor-app-server
~~~

Now create an index.html file with the following contents:

~~~html
<!-- index.html -->
<html>
  <head>
    <script src="/falcor.browser.js"></script>
    <script>
      var model = new falcor.Model({source: new falcor.HttpDataSource('/model.json') });
      
      // retrieve the "greeting" key from the root of the Virtual JSON resource
      model.
        get("greeting").
        then(function(response) {
          document.write(response.json.greeting);
        });
    </script>
  </head>
  <body>
  </body>
</html>
~~~

Now visit http://localhost:3000/index.html and you should see the message retrieved from the server:

![Hello World]({{ site.baseurl }}/starter/helloworld.png)
