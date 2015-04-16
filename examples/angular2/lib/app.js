System.register("app", ["angular2/angular2", "angular2/di"], function($__export) {
  "use strict";
  var __moduleName = "app";
  var Component,
      View,
      NgElement,
      If,
      For,
      bootstrap,
      bind,
      Movie,
      GenreList,
      App;
  function getCache() {
    var $ref = falcor.Model.ref;
    return {
      genres: [{
        titles: [$ref('titlesById[99]'), $ref('titlesById[80]'), $ref('titlesById[77]'), $ref('titlesById[42]'), $ref('titlesById[7]'), $ref('titlesById[9]'), $ref('titlesById[60]'), $ref('titlesById[12]')],
        name: 'New Releases'
      }, {
        titles: [$ref('titlesById[99]'), $ref('titlesById[80]'), $ref('titlesById[77]'), $ref('titlesById[42]'), $ref('titlesById[7]'), $ref('titlesById[9]'), $ref('titlesById[60]'), $ref('titlesById[12]')],
        name: 'Thrillers'
      }, {
        titles: [$ref('titlesById[99]'), $ref('titlesById[80]'), $ref('titlesById[77]'), $ref('titlesById[42]'), $ref('titlesById[7]'), $ref('titlesById[9]'), $ref('titlesById[60]'), $ref('titlesById[12]')],
        name: 'Dramas'
      }, {
        titles: [$ref('titlesById[99]'), $ref('titlesById[80]'), $ref('titlesById[77]'), $ref('titlesById[42]'), $ref('titlesById[7]'), $ref('titlesById[9]'), $ref('titlesById[60]'), $ref('titlesById[12]')],
        name: 'Horror Movies'
      }],
      titlesById: {
        '12': {
          name: 'The Wolf of Wall Street',
          rating: 5,
          img: 'http://cdn2.nflximg.net/webp/8752/11138752.webp'
        },
        '60': {
          name: 'Bates Motel',
          rating: 5,
          img: 'http://cdn0.nflximg.net/webp/8540/12128540.webp'
        },
        '7': {
          name: 'Orange Is the new Black',
          rating: 4,
          img: 'http://cdn3.nflximg.net/webp/8153/11798153.webp'
        },
        '9': {
          name: 'Breaking Bad',
          rating: 5,
          img: 'http://cdn0.nflximg.net/webp/7300/4177300.webp'
        },
        '42': {
          name: 'Cosmos',
          rating: 5,
          img: 'http://cdn2.nflximg.net/webp/2642/9972642.webp'
        },
        '99': {
          name: 'House of Cards',
          rating: 5,
          img: 'http://cdn5.nflximg.net/webp/8265/13038265.webp'
        },
        '80': {
          name: 'Halt and Catch Fire',
          rating: 5,
          img: 'http://cdn4.nflximg.net/webp/8454/12968454.webp'
        },
        '77': {
          name: 'Daredevil',
          rating: 5,
          img: 'http://cdn6.nflximg.net/webp/5516/20935516.webp'
        }
      }
    };
  }
  return {
    setters: [function($__m) {
      Component = $__m.Component;
      View = $__m.View;
      NgElement = $__m.NgElement;
      If = $__m.If;
      For = $__m.For;
      bootstrap = $__m.bootstrap;
    }, function($__m) {
      bind = $__m.bind;
    }],
    execute: function() {
      Movie = (function() {
        function Movie() {}
        return ($traceurRuntime.createClass)(Movie, {rate: function(num) {
            var stars = '';
            if (num !== undefined) {
              for (var counter = 0; counter < 5; counter++) {
                stars += (counter < num) ? "★" : "☆";
              }
            }
            return stars;
          }}, {});
      }());
      Object.defineProperty(Movie, "annotations", {get: function() {
          return [new Component({
            selector: 'movie',
            properties: {model: 'model'}
          }), new View({
            template: "\n  <div style=\"display:inline-block\">\n    <a [href]=\"'#/'+ (model.getValue('name') | async)\">\n      <div>\n        <h3>{{ model.getValue('name') | async }}</h3>\n        Rating {{ rate((model.getValue('rating') | async)) }}\n      </div>\n      <img [src]=\"model.getValue('img') | async\">\n    </a>\n  </div>\n  ",
            directives: []
          })];
        }});
      GenreList = (function() {
        function GenreList() {}
        return ($traceurRuntime.createClass)(GenreList, {}, {});
      }());
      Object.defineProperty(GenreList, "annotations", {get: function() {
          return [new Component({
            selector: 'genres-list',
            properties: {model: 'model'}
          }), new View({
            template: "\n  <style>\n    .scroll-row {\n      width: auto;\n      overflow-x: scroll;\n      overflow-y: hidden;\n      white-space: nowrap;\n      position: relative;\n    }\n  </style>\n\n  <h2>\n    {{ model.getValue(['name']) | async }}\n  </h2>\n  <div class=\"scroll-row\">\n    <movie [model]=\"model.bind('titles[0]', 'name') | async\"></movie>\n    <movie [model]=\"model.bind('titles[1]', 'name') | async\"></movie>\n    <movie [model]=\"model.bind('titles[2]', 'name') | async\"></movie>\n    <movie [model]=\"model.bind('titles[3]', 'name') | async\"></movie>\n    <movie [model]=\"model.bind('titles[4]', 'name') | async\"></movie>\n    <movie [model]=\"model.bind('titles[5]', 'name') | async\"></movie>\n    <movie [model]=\"model.bind('titles[6]', 'name') | async\"></movie>\n    <movie [model]=\"model.bind('titles[7]', 'name') | async\"></movie>\n  <scroll-row>\n  ",
            directives: [Movie]
          })];
        }});
      App = (function() {
        function App() {
          var Model = falcor.Model;
          var $ref = falcor.Model.ref;
          var model = new Model({cache: getCache()});
          this.model = model;
        }
        return ($traceurRuntime.createClass)(App, {}, {});
      }());
      Object.defineProperty(App, "annotations", {get: function() {
          return [new Component({selector: 'app'}), new View({
            template: "\n  <center>\n    <h1>Angular 2 + FalcorJS</h1>\n  </center>\n\n  <genres-list [model]=\"model.bind('genres[0]', 'name') | async\"></genres-list>\n  <genres-list [model]=\"model.bind('genres[1]', 'name') | async\"></genres-list>\n  <genres-list [model]=\"model.bind('genres[2]', 'name') | async\"></genres-list>\n  <genres-list [model]=\"model.bind('genres[3]', 'name') | async\"></genres-list>\n\n  ",
            directives: [If, For, GenreList]
          })];
        }});
      bootstrap(App);
    }
  };
});

//# sourceMappingURL=app.js.map