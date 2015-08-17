
## Getting Started

You can check out a working example server for a Netflix-like application [here](http://github.com/netflix/falcor-express-demo) right now. Alternately you can go through this barebones tutorial in which we use the Falcor Router to create a Virtual JSON resource. In this tutorial we will use Falcor's express middleware to serve the Virtual JSON resource on an application server at the URL /model.json. We will also host a static web page on the same server which retrieves data from the Virtual JSON resource.

### Creating a Virtual JSON Resource

In this example we will use the Falcor Router to build a Virtual JSON resource on an app server and host it at /model.json. The JSON resource will contain the following contents:

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

// serve static files from current directory
app.use(express.static(__dirname + '/'));

var server = app.listen(3000);

~~~

Now we run the server, which will listen on port 3000 for requests for /model.json.

~~~sh
node index.js
~~~

### Retrieving Data from the Virtual JSON resource

Now that we've built a simple virtual JSON document with a single read-only key "greeting", we will create a test web page and retrieve this key from the server.

Now create an index.html file with the following contents:

~~~html
<!-- index.html -->
<html>
  <head>
    <!-- Do _not_  rely on this URL in production. Use only during development.  -->
    <script src="//netflix.github.io/falcor/build/falcor.browser.js"></script>
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

## More Resources

For discussion and questions, use [Stack Overflow](http://stackoverflow.com/questions/tagged/falcor).
