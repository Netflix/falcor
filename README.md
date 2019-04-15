<p align="center">
  <img src="https://cloud.githubusercontent.com/assets/1016365/8711049/66438ebc-2b03-11e5-8a8a-75934f7ca7ec.png">
</p>

# Falcor

[![Build Status](https://travis-ci.org/Netflix/falcor.svg)](https://travis-ci.org/Netflix/falcor)
[![Coverage Status](https://coveralls.io/repos/Netflix/falcor/badge.svg?branch=master&service=github)](https://coveralls.io/github/Netflix/falcor?branch=master)

## 2.0

**2.0** is the current stable Falcor release. **0.x** and **1.x** users are
welcome to upgrade.

* [Breaking changes between **1.x** and **2.0**](https://github.com/Netflix/falcor/blob/master/MIGRATIONS.md).
* [Breaking changes between **0.x** and **1.x**](https://github.com/Netflix/falcor/blob/1.0.0/MIGRATIONS.md).

## Roadmap

Issues we're tracking as part of our roadmap are tagged with the
[roadmap](https://github.com/Netflix/falcor/issues?q=is%3Aopen+is%3Aissue+label%3Aroadmap)
label. They are split into
[enhancement](https://github.com/Netflix/falcor/issues?q=is%3Aopen+is%3Aissue+label%3Aroadmap+label%3Aenhancement),
[stability](https://github.com/Netflix/falcor/issues?q=is%3Aopen+is%3Aissue+label%3Aroadmap+label%3Astability),
[performance](https://github.com/Netflix/falcor/issues?q=is%3Aopen+is%3Aissue+label%3Aroadmap+label%3Aperformance),
[tooling](https://github.com/Netflix/falcor/issues?q=is%3Aopen+is%3Aissue+label%3Aroadmap+label%3Atooling),
[infrastructure](https://github.com/Netflix/falcor/issues?q=is%3Aopen+is%3Aissue+label%3Aroadmap+label%3Ainfrastructure)
and
[documentation](https://github.com/Netflix/falcor/issues?q=is%3Aopen+is%3Aissue+label%3Aroadmap+label%3Adocumentation)
categories, with near, medium and longer term labels to convey a broader sense
of the order in which we plan to approach them.

## Getting Started

You can check out [a working example server for Netflix-like application](https://github.com/netflix/falcor-express-demo) right now. Alternately, you
can go through this barebones tutorial in which we use the Falcor Router to
create a Virtual JSON resource. In this tutorial we will use Falcor's express
middleware to serve the Virtual JSON resource on an application server at the
URL `/model.json`. We will also host a static web page on the same server which
retrieves data from the Virtual JSON resource.

### Creating a Virtual JSON Resource

In this example we will use the falcor Router to build a Virtual JSON resource
on an app server and host it at `/model.json`. The JSON resource will contain
the following contents:

~~~js
{
  "greeting": "Hello World"
}
~~~

Normally, Routers retrieve the data for their Virtual JSON resource from backend
datastores or other web services on-demand. However, in this simple tutorial, the
Router will simply return static data for a single key.

First we create a folder for our application server.

~~~bash
$ mkdir falcor-app-server
$ cd falcor-app-server
$ npm init
~~~

Now we install the falcor Router.

~~~bash
$ npm install falcor-router --save
~~~

Then install express and falcor-express.  Support for restify is also available,
as is support for hapi via a [third-party
implementation](https://github.com/Netflix/falcor-hapi).

~~~bash
$ npm install express --save
$ npm install falcor-express --save
~~~

Now we create an `index.js` file with the following contents:

~~~js
// index.js
const falcorExpress = require('falcor-express');
const Router = require('falcor-router');

const express = require('express');
const app = express();

app.use('/model.json', falcorExpress.dataSourceRoute(function (req, res) {
  // create a Virtual JSON resource with single key ('greeting')
  return new Router([
    {
      // match a request for the key 'greeting'
      route: 'greeting',
      // respond with a PathValue with the value of 'Hello World.'
      get: () => ({path: ['greeting'], value: 'Hello World'})
    }
  ]);
}));

// serve static files from current directory
app.use(express.static(__dirname + '/'));

app.listen(3000);
~~~

Now we run the server, which will listen on port `3000` for requests for
`/model.json`.

~~~bash
$ node index.js
~~~

### Retrieving Data from the Virtual JSON resource

Now that we've built a simple virtual JSON document with a single read-only key
`greeting`, we will create a test web page and retrieve this key from the
server.

Create an `index.html` file with the following contents:

~~~html
<!-- index.html -->
<html>
  <head>
    <!-- Do _not_  rely on this URL in production. Use only during development.  -->
    <script src="https://netflix.github.io/falcor/build/falcor.browser.js"></script>
    <!-- For production use. -->
    <!-- <script src="https://cdn.jsdelivr.net/falcor/{VERSION}/falcor.browser.min.js"></script> -->
    <script>
      var model = falcor({source: new falcor.HttpDataSource('/model.json') });

      // retrieve the "greeting" key from the root of the Virtual JSON resource
      model.
        get('greeting').
        then(function(response) {
          document.write(response.json.greeting);
        });
    </script>
  </head>
  <body>
  </body>
</html>
~~~

Now visit `http://localhost:3000/index.html` and you should see the message
retrieved from the server:

```
Hello World
```

## Steps to publish new version

- Make pull request with feature/bug fix and tests
- Merge pull request into master after code review and passing Travis CI checks
- Run `git checkout master` to open `master` branch locally
- Run `git pull` to merge latest code, including built `dist/` and `docs/` by Travis
- Update CHANGELOG with features/bug fixes to be released in the new version
- Run `npm run prepare` to build `dist/` locally
- Ensure the built files are not different from those built by Travis CI,
  hence creating no change to commit
- Run `npm version patch` (or `minor`, `major`, etc) to create a new git commit and tag
- Run `git push origin master && git push --tags` to push code and tags to github
- Run `npm publish` to publish the latest version to NPM

## Additional Resources

* For detailed high-level documentation explaining the Model, the Router, and JSON
Graph check out the [Falcor website](https://netflix.github.io/falcor).

* [API documentation](https://netflix.github.io/falcor/doc/Model.html)

* For a working example of a Router, check out the
[falcor-router-demo](https://github.com/netflix/falcor-router-demo).

* For questions and discussion, use [Stack
Overflow](https://stackoverflow.com/questions/tagged/falcor).

