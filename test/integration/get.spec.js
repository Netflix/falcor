// This file starts the server and exposes the Router at /model.json
var express = require('express');
var FalcorServer = require('falcor-express');
var falcor = require('./../../browser');
var expect = require('chai').expect;
var sinon = require('sinon');
var Router = require('falcor-router');
var after = require('after');
var strip = require('./../cleanData').stripDerefAndVersionKeys;
var noOp = function() {};

describe('Get Integration Tests', function() {
    var app, server, serverUrl;

    beforeEach(function(done) {
        app = express();
        app.pathQueries = [];
        app.use(function(req, res, next) {
            app.pathQueries.push(JSON.parse(req.query.paths));
            log('pathQuery', req.query.paths);
            next();
        });
        server = app.listen(1337, done);
        serverUrl = 'http://localhost:1337';
    });

    it('should be able to return null from a router. #535', function(done) {
        var model = getModel();
        var onNext = sinon.spy();
        setRoutes([
            {
                route: ['thing', 'prop'],
                get: function (path) {
                    return {
                        path: ['thing', 'prop'],
                        value: null
                    };
                }
            }
        ]);

        toObservable(model.
            get(['thing', 'prop'])).
            doAction(onNext, noOp, function() {
                expect(onNext.calledOnce).to.be.ok;
                expect(strip(onNext.getCall(0).args[0])).to.deep.equals({
                    json: {
                        thing: {
                            prop: null
                        }
                    }
                });
            }).
            subscribe(noOp, done, done);
    });

    describe.only('Request deduping', function() {
        it('should dedupe new requested paths with previous in-flight requests', function(done) {
            var model = getModel();
            setServerCache({
                things: {
                    0: 'thing: 0',
                    1: 'thing: 1',
                    2: 'thing: 2'
                }
            });
            var partDone = after(2, done);

            model.get(['things', { from: 0, to: 1 }]).subscribe(function(response) {
                expect(app.pathQueries[0]).to.deep.equal([['things', { from: 0, to: 1 }]]);
                expect(strip(response.json)).to.deep.equal({
                    things: {
                        0: 'thing: 0',
                        1: 'thing: 1'
                    }
                });
            }, done, partDone);
            model.get(['things', { from: 1, to: 2 }]).subscribe(function(response) {
                expect(app.pathQueries[1]).to.deep.equal([['things', '2']]);
                expect(strip(response.json)).to.deep.equal({
                    things: {
                        1: 'thing: 1',
                        2: 'thing: 2'
                    }
                });
            }, done, partDone);
        });

        it('should dedupe from both ends of overlapping ranges', function(done) {
            var model = getModel();
            setServerCache({
                things: {
                    0: 'thing: 0',
                    1: 'thing: 1',
                    2: 'thing: 2',
                    3: 'thing: 3',
                    4: 'thing: 4',
                }
            });
            var partDone = after(2, done);

            model.get(['things', { from: 1, to: 2 }]).subscribe(function(response) {
                expect(app.pathQueries[0]).to.deep.equal([['things', { from: 1, to: 2 }]]);
            }, done, partDone);
            model.get(['things', { from: 0, to: 4 }]).subscribe(function(response) {
                expect(app.pathQueries[1]).to.deep.equal([['things', [0, 3, 4]]]);
            }, done, partDone);
        });

        it('should leave ranges unrolled if possible', function(done) {
            var model = getModel();
            setServerCache({
                things: {
                    0: 'thing: 0',
                    1: 'thing: 1',
                    2: 'thing: 2',
                    3: 'thing: 3',
                    4: 'thing: 4',
                }
            });
            var partDone = after(2, done);

            model.get(['things', { from: 0, to: 2 }]).subscribe(noOp, done, partDone);
            model.get(['things', { from: 0, to: 4 }]).subscribe(function(response) {
                expect(app.pathQueries[1]).to.deep.equal([['things', { from: 3, to: 4 }]]);
            }, done, partDone);
        });

        it('should work for properties after ranges', function(done) {
            var model = getModel();
            setServerCache({
                things: {
                    0: { name: 'thing: 0' },
                    1: { name: 'thing: 1' },
                    2: { name: 'thing: 2' },
                }
            });
            var partDone = after(2, done);

            model.get(['things', { from: 0, to: 1 }, 'name']).subscribe(noOp, done, partDone);
            model.get(['things', { from: 1, to: 2 }, 'name']).subscribe(function() {
                log('pathQueries', app.pathQueries);
                expect(app.pathQueries[1]).to.deep.equal([['things', 2, 'name']]);
            }, done, partDone);
        });

        it('should work for multiple ranges in path sets', function(done) {
            var model = getModel();
            setServerCache({
                things: {
                    0: { name: 'thing: 0', tags: { 0: 'thing: 0, tag: 0', 1: 'thing: 0, tag: 1' } },
                    1: { name: 'thing: 1', tags: { 0: 'thing: 1, tag: 0', 1: 'thing: 1, tag: 1' } },
                    2: { name: 'thing: 2', tags: { 0: 'thing: 2, tag: 0', 1: 'thing: 2, tag: 1' } },
                }
            });
            var partDone = after(2, done);

            partDone(); partDone();
        });
    });

    afterEach(function(done) {
        server.close(done);
    });

    function getModel() {
        return new falcor.Model({
            source: new falcor.HttpDataSource(serverUrl + '/model.json')
        });
    }
    function getThingsRoute() {
        return {
            route: 'things[{integers}]',
            get: function(pathSet) {
                return pathSet[1].map(function(id) {
                    return {
                        path: ['things', id],
                        value: 'thing: ' + id
                    }
                });
            }
        };
    }
    function setRoutes(routes) {
      app.use('/model.json', FalcorServer.dataSourceRoute(function() {
          return new Router(routes);
      }));
    }

    function setServerCache(cache) {
        var serverModel = new falcor.Model({ cache: cache });
        app.use('/model.json', FalcorServer.dataSourceRoute(function() {
            return serverModel.asDataSource();
        }));
    }
});

function str(v, t) {
  v = v instanceof Error ?
    'Error: ' + v.message :
    typeof v === 'object' && v !== null ? strip(v) : v;
  try {
    return JSON.stringify(v, null, t || 2);
  } catch (e) {
    return v;
  }
}
function logger(ns) {
  return function() {
    console.log('>>>>', ns);
    [].slice.call(arguments).map(str).forEach(v => {
      console.log('  >>', v);
    });
    console.log('');
  };
}
var log = logger('log');
