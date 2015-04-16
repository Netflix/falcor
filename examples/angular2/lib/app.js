System.register("app", ["angular2/angular2", "angular2/directives", "angular2/di", "ViewTeleporter"], function($__export) {
  "use strict";
  var __moduleName = "app";
  var Component,
      View,
      Decorator,
      ViewPort,
      bootstrap,
      NgElement,
      If,
      For,
      bind,
      Router,
      MovieDetails,
      Movie,
      GenreList,
      App;
  function getCache() {
    var $ref = falcor.Model.ref;
    return {
      genres: [{
        titles: [$ref('titlesById[99]'), $ref('titlesById[80]'), $ref('titlesById[77]'), $ref('titlesById[9]')],
        name: 'Thrillers'
      }, {
        titles: [$ref('titlesById[60]'), $ref('titlesById[51]'), $ref('titlesById[62]'), $ref('titlesById[65]')],
        name: 'Horror Movies'
      }, {
        titles: [$ref('titlesById[7]'), $ref('titlesById[33]'), $ref('titlesById[89]'), $ref('titlesById[99]')],
        name: 'Netflix Originals'
      }, {
        titles: [$ref('titlesById[12]'), $ref('titlesById[42]'), $ref('titlesById[9]'), $ref('titlesById[7]')],
        name: 'Dramas'
      }],
      titlesById: {
        '99': {
          name: 'House of Cards',
          rating: 5,
          img: 'http://cdn5.nflximg.net/webp/8265/13038265.webp',
          starring: 'Kevin Spacey, Robin Wright, Kate Mara',
          genres: 'TV Shows, TV Dramas',
          year: '2013-2015',
          tvRating: 'TV-MA',
          seasons: 3,
          showIs: 'Witty, Cerebral, Dark',
          averageRating: 4.5,
          numberOfRating: 6029997,
          copy: 'This Emmy-winning original thriller series stars Golden Globe winner Kevin Spacey as ruthless, cunning Congressman Francis Underwood, who will stop at nothing to conquer the halls of power in Washington D.C. His secret weapon: his gorgeous, ambitious, and equally conniving wife Claire (Golden Globe winner Robin Wright).'
        },
        '12': {
          name: 'The Wolf of Wall Street',
          rating: 5,
          img: 'http://cdn2.nflximg.net/webp/8752/11138752.webp',
          copy: 'Martin Scorcese\'s high-rolling Wall Street drama is based on the memoirs of stockbroker Jordan Belfort, whose giddy career ended in federal prison.',
          starring: 'Leonardo DiCaprio, Jonah Hill, Margot Robbie, Matthew McConaughey, Kyle Chandler, Jon Bernthal',
          genres: 'Dramas based on Books, Crime Dramas, Biographical Dramas, Dramas, Dramas based on real life'
        },
        '33': {
          name: 'Marco Polo',
          rating: 5,
          img: 'http://cdn0.nflximg.net/webp/9400/11749400.webp',
          starring: 'Lorenzo Richelmy, Benedict Wong, Chin Han',
          genres: 'TV Shows, TV Dramas, TV Action & Adventure',
          copy: 'Worlds will collide "Marco Polo" is an epic adventure that follows the early years of the famous explorer as he travels the exotic Silk Road to the great Kublai Khan’s court. But Marco soon finds that navigating the Khan’s world of greed, betrayal, sexual intrigue and rivalry will be his greatest challenge yet, even as he becomes a trusted companion to the Khan in his violent quest to become the Emperor of the World.'
        },
        '89': {
          name: 'Arrested Development',
          seasons: 4,
          img: 'http://cdn8.nflximg.net/webp/1088/11741088.webp',
          starring: 'Jason Bateman, Portia de Rossi, Will Arnett',
          genres: 'Sitcoms, TV Shows, TV Comedies',
          copy: 'It\'s the story of a wealthy family that lost everything, and the one son who had no choice but to keep them all together. It\'s the return of the award-winning “Arrested Development,” starring Emmy nominee Jason Bateman and one of the funniest ensembles in TV comedy, who taught viewers the meaning of “never nude,” spread a dangerous amount of misinformation about maritime law, and reminded everyone “that\'s why you always leave a note.”'
        },
        '60': {
          name: 'Bates Motel',
          rating: 5,
          seasons: 2,
          img: 'http://cdn0.nflximg.net/webp/8540/12128540.webp',
          copy: 'Everyone knows what happened in "Psycho," but this chilling series takes viewers inside Norman Bates\' world before Marion Crane checked in.',
          starring: 'Vera Farmiga, Freddie Highmore, Max Thieriot, Olivia Cooke, Nicola Peltz, Nestor Carbonell',
          genres: 'TV Shows, TV Dramas, TV Horror, TV Mysteries'
        },
        '7': {
          name: 'Orange Is the new Black',
          rating: 4,
          seasons: 3,
          img: 'http://cdn3.nflximg.net/webp/8153/11798153.webp',
          copy: 'A dozen Emmy Award nominations went to this acclaimed comedy drama series including Outstanding Comedy Series, Outstanding Writing and Outstanding Lead Actress for star Taylor Schilling. A crime she committed in her youthful past sends Piper Chapman (Schilling) to a women\'s prison, where she trades her comfortable New York life for one of unexpected camaraderie and conflict in an eccentric group of fellow inmates.',
          genres: 'TV Shows, TV Dramas, TV Comedies',
          starring: 'Taylor Schilling, Jason Biggs, Kate Mulgrew'
        },
        '9': {
          name: 'Breaking Bad',
          rating: 5,
          seasons: 5,
          img: 'http://cdn0.nflximg.net/webp/7300/4177300.webp',
          copy: 'A high school chemistry teacher dying of cancer teams with a former student to secure his family\'s future by manufacturing and selling crystal meth.',
          starring: 'Bryan Cranston, Aaron Paul, Anna Gunn, Dean Norris, Betsy Brandt, R.J. Mitte',
          genres: 'TV Shows, TV Dramas, Crime TV Shows, Crime TV Dramas'
        },
        '42': {
          name: 'Cosmos',
          rating: 5,
          img: 'http://cdn2.nflximg.net/webp/2642/9972642.webp'
        },
        '65': {
          name: 'Leprechaun',
          rating: 3,
          img: 'http://cdn9.nflximg.net/webp/3769/4123769.webp',
          copy: 'A father and daughter\'s move to a new home is anything but lucky when they find that a murderous 600-year-old leprechaun is living in their basement.',
          starring: 'Warwick Davis, Jennifer Aniston, Ken Olandt, Mark Holton, Robert Hy Gorman',
          genres: 'Horror Movies, Creature Features, Supernatural Horror Movies, Cult Horror Movies, Cult Movies, Monster Movies'
        },
        '80': {
          name: 'Halt and Catch Fire',
          rating: 5,
          seasons: 1,
          img: 'http://cdn4.nflximg.net/webp/8454/12968454.webp',
          starring: 'Lee Pace, Scoot McNairy, Mackenzie Davis, Kerry Bishé, Toby Huss, David Wilson Barnes',
          genres: 'TV Shows, TV Dramas',
          copy: 'Re-creating the dawn of the personal computer era, this digital drama tracks the fates of an industry visionary and his brilliant colleagues.'
        },
        '51': {
          name: 'Event Horizon',
          rating: 5,
          copy: 'After a signal is received from a long-missing spaceship, a rescue ship investigates, but the crew soon realizes something unimaginable has happened.',
          img: 'http://cdn1.nflximg.net/images/6797/8256797.jpg',
          starring: 'Laurence Fishburne, Sam Neill, Kathleen Quinlan, Joely Richardson, Richard T. Jones, Jack Noseworthy',
          genres: 'Horror Movies, Sci-Fi & Fantasy, Supernatural Horror Movies, Sci-Fi Horror Movies'
        },
        '62': {
          name: 'Sharknado',
          rating: 2,
          copy: 'When a hurricane swamps Los Angeles, thousands of sharks are swept up in tornadoes and deposited all over the city, where they terrorize residents.',
          starring: 'Ian Ziering, Tara Reid, John Heard, Cassandra Scerbo, Jaason Simmons, Alex Arleo',
          genres: 'B-Horror Movies, Horror Movies, Sci-Fi & Fantasy, Sci-Fi Thrillers, Sci-Fi Horror Movies, Cult Horror Movies, Cult Sci-Fi & Fantasy, Thrillers, Cult Movies, Deep Sea Horror Movies',
          img: 'http://cdn1.nflximg.net/images/2415/3932415.jpg'
        },
        '77': {
          name: 'Daredevil',
          rating: 5,
          img: 'http://cdn6.nflximg.net/webp/5516/20935516.webp',
          copy: '"Marvel\'s Daredevil" is a live action series that follows the journey of attorney Matt Murdock, who in a tragic accident was blinded as a boy but imbued with extraordinary senses. Murdock sets up practice in his old neighborhood of Hell\'s Kitchen, New York where he now fights against injustice as a respected lawyer by day and masked vigilante at night.',
          starring: 'Charlie Cox, Deborah Ann Woll, Vincent D\'Onofrio',
          genres: 'Comic Book and Superhero Movies, TV Shows, Crime TV Shows'
        }
      }
    };
  }
  return {
    setters: [function($__m) {
      Component = $__m.Component;
      View = $__m.View;
      Decorator = $__m.Decorator;
      ViewPort = $__m.ViewPort;
      bootstrap = $__m.bootstrap;
      NgElement = $__m.NgElement;
    }, function($__m) {
      If = $__m.If;
      For = $__m.For;
    }, function($__m) {
      bind = $__m.bind;
    }, function($__m) {
      Router = $__m.Router;
    }],
    execute: function() {
      MovieDetails = (function() {
        function MovieDetails(router) {
          this.router = router;
        }
        return ($traceurRuntime.createClass)(MovieDetails, {
          back: function() {
            this.router.back();
          },
          rate: function(num) {
            var stars = '';
            if (num !== undefined) {
              for (var counter = 0; counter < 5; counter++) {
                stars += (counter < num) ? "★" : "☆";
              }
            }
            return stars;
          }
        }, {});
      }());
      Object.defineProperty(MovieDetails, "annotations", {get: function() {
          return [new Component({
            selector: 'movie-details',
            properties: {model: 'model'}
          }), new View({
            template: "\n  <button (click)=\"back()\">Back</button>\n  <h3 class=\"movie-name\">{{ model.getValue('name') | async }}</h3>\n  <hr>\n  <div class=\"side-details\">\n    <img [src]=\"model.getValue('img') | async\">\n    <div>\n      Rating {{ rate((model.getValue('rating') | async)) }}\n    </div>\n  </div>\n  <div class=\"movie-copy\">\n    <p>\n      {{ model.getValue('copy') | async }}\n    </p>\n    <ul>\n      <li>\n        <b>Starring</b>: {{ model.getValue('starring') | async }}\n      </li>\n      <li>\n        <b>Genres</b>: {{ model.getValue('genres') | async }}\n      </li>\n    <ul>\n  </div>\n  ",
            directives: [If]
          })];
        }});
      Object.defineProperty(MovieDetails, "parameters", {get: function() {
          return [[Router]];
        }});
      Movie = (function() {
        function Movie(router) {
          this.router = router;
        }
        return ($traceurRuntime.createClass)(Movie, {details: function(model) {
            this.router.details(model);
          }}, {});
      }());
      Object.defineProperty(Movie, "annotations", {get: function() {
          return [new Component({
            selector: 'movie',
            properties: {model: 'model'},
            injectables: [Router]
          }), new View({
            template: "\n  <div class=\"movie\">\n    <a (^click)=\"details(model)\" [href]=\"'#/'+ (model.getValue('name') | async)\" >\n      <img [src]=\"model.getValue('img') | async\" class=\"boxShotImg movie-box-image\">\n    </a>\n  </div>\n  ",
            directives: []
          })];
        }});
      Object.defineProperty(Movie, "parameters", {get: function() {
          return [[Router]];
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
            template: "\n  <h2 class=\"genre-name\">\n    {{ model.getValue('name') | async }}\n  </h2>\n  <div class=\"scroll-row\">\n    <movie [model]=\"model.bind('titles[0]', 'name') | async\"></movie>\n    <movie [model]=\"model.bind('titles[1]', 'name') | async\"></movie>\n    <movie [model]=\"model.bind('titles[2]', 'name') | async\"></movie>\n    <movie [model]=\"model.bind('titles[3]', 'name') | async\"></movie>\n  <div>\n  ",
            directives: [Movie]
          })];
        }});
      App = (function() {
        function App(router) {
          var model = new falcor.Model({cache: getCache()});
          this.model = model;
          this.router = router;
          this.details = true;
          model.bind('genres[0].titles[0]', 'name').forEach(this.setRoute.bind(this));
          this.router.onChange(this.changeRoute.bind(this));
        }
        return ($traceurRuntime.createClass)(App, {
          home: function() {
            this.details = false;
          },
          changeRoute: function(model) {
            if (model) {
              this.detailModel = model;
              this.details = true;
            } else {
              if (this.lastValue) {
                this.detailModel = this.lastValue;
              }
              this.details = false;
            }
          },
          setRoute: function(json) {
            this.lastValue = this.detailModel;
            this.detailModel = json;
          }
        }, {});
      }());
      Object.defineProperty(App, "annotations", {get: function() {
          return [new Component({
            selector: 'app',
            injectables: [Router]
          }), new View({
            template: "\n  <navbar id=\"hd\">\n    <h1 class=\"logo\" (click)=\"home()\">\n      Angular 2 + FalcorJS\n    </h1>\n  </navbar>\n\n  <main>\n    <div *if=\"details\">\n      <movie-details [model]=\"detailModel\"></movie-details>\n    </div>\n\n\n    <div *if=\"!details\">\n      <genres-list [model]=\"model.bind('genres[0]', 'name') | async\"></genres-list>\n      <genres-list [model]=\"model.bind('genres[1]', 'name') | async\"></genres-list>\n      <genres-list [model]=\"model.bind('genres[2]', 'name') | async\"></genres-list>\n      <genres-list [model]=\"model.bind('genres[3]', 'name') | async\"></genres-list>\n    </div>\n  </main>\n\n\n  ",
            directives: [If, GenreList, MovieDetails]
          })];
        }});
      Object.defineProperty(App, "parameters", {get: function() {
          return [[Router]];
        }});
      bootstrap(App);
    }
  };
});
