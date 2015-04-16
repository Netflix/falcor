import {Component, View, NgElement} from 'angular2/angular2';
import {If, For} from 'angular2/angular2';
import {bootstrap} from 'angular2/angular2';
import {bind} from 'angular2/di';


@Component({
  selector: 'movie',
  properties: {
    model: 'model'
  }
})
@View({
  template: `
  <div style="display:inline-block">
    <a [href]="'#/'+ (model.getValue('name') | async)">
      <div>
        <h3>{{ model.getValue('name') | async }}</h3>
        Rating {{ rate((model.getValue('rating') | async)) }}
      </div>
      <img [src]="model.getValue('img') | async">
    </a>
  </div>
  `,
  directives: []
})
class Movie {
  constructor() {
  }

  rate(num) {
    var stars = '';
    if (num !== undefined) {
      for(var counter = 0; counter < 5; counter++) {
        stars += (counter < num) ? "★" : "☆";
      }
    }
    return stars;
  }

}


@Component({
  selector: 'genres-list',
  properties: {
    model: 'model'
  }
})
@View({
  template: `
  <style>
    .scroll-row {
      width: auto;
      overflow-x: scroll;
      overflow-y: hidden;
      white-space: nowrap;
      position: relative;
    }
  </style>

  <h2>
    {{ model.getValue(['name']) | async }}
  </h2>
  <div class="scroll-row">
    <movie [model]="model.bind('titles[0]', 'name') | async"></movie>
    <movie [model]="model.bind('titles[1]', 'name') | async"></movie>
    <movie [model]="model.bind('titles[2]', 'name') | async"></movie>
    <movie [model]="model.bind('titles[3]', 'name') | async"></movie>
    <movie [model]="model.bind('titles[4]', 'name') | async"></movie>
    <movie [model]="model.bind('titles[5]', 'name') | async"></movie>
    <movie [model]="model.bind('titles[6]', 'name') | async"></movie>
    <movie [model]="model.bind('titles[7]', 'name') | async"></movie>
  <div>
  `,
  directives: [ Movie ]
})
class GenreList {}

@Component({
  selector: 'app'
})
@View({
  template: `
  <center>
    <h1>Angular 2 + FalcorJS</h1>
  </center>

  <genres-list [model]="model.bind('genres[0]', 'name') | async"></genres-list>
  <genres-list [model]="model.bind('genres[1]', 'name') | async"></genres-list>
  <genres-list [model]="model.bind('genres[2]', 'name') | async"></genres-list>
  <genres-list [model]="model.bind('genres[3]', 'name') | async"></genres-list>

  `,
  directives: [ If, For, GenreList ]
})
class App {
  constructor() {
    var Model = falcor.Model;
    var $ref  = falcor.Model.ref;

    var model = new Model({
      cache: getCache()
    });

    this.model = model;
  }
}


bootstrap(App);



function getCache() {
  var $ref = falcor.Model.ref;
  return {
    genres: [
      {
        titles: [
          $ref('titlesById[99]'),
          $ref('titlesById[80]'),
          $ref('titlesById[77]'),
          $ref('titlesById[42]'),
          $ref('titlesById[7]'),
          $ref('titlesById[9]'),
          $ref('titlesById[60]'),
          $ref('titlesById[12]'),
        ],
        name: 'New Releases'
      },
      {
        titles: [
          $ref('titlesById[99]'),
          $ref('titlesById[80]'),
          $ref('titlesById[77]'),
          $ref('titlesById[42]'),
          $ref('titlesById[7]'),
          $ref('titlesById[9]'),
          $ref('titlesById[60]'),
          $ref('titlesById[12]'),
        ],
        name: 'Thrillers'
      },
      {
        titles: [
          $ref('titlesById[99]'),
          $ref('titlesById[80]'),
          $ref('titlesById[77]'),
          $ref('titlesById[42]'),
          $ref('titlesById[7]'),
          $ref('titlesById[9]'),
          $ref('titlesById[60]'),
          $ref('titlesById[12]'),
        ],
        name: 'Dramas'
      },
      {
        titles: [
          $ref('titlesById[99]'),
          $ref('titlesById[80]'),
          $ref('titlesById[77]'),
          $ref('titlesById[42]'),
          $ref('titlesById[7]'),
          $ref('titlesById[9]'),
          $ref('titlesById[60]'),
          $ref('titlesById[12]'),
        ],
        name: 'Horror Movies'
      }
    ],
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
