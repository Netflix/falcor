var falcor = require('../../browser');
var LocalDataSource = require('../data/LocalDataSource');
var after = require('after');
var expect = require('chai').expect;
var sinon = require('sinon');
var strip = require('../cleanData').stripDerefAndVersionKeys;
var $ref = falcor.Model.ref;
var noOp = function() {};

describe('Request deduping', function() {
    it('should dedupe new requested paths with previous in-flight requests', function(done) {
        var onGet = sinon.spy();
        var model = new falcor.Model({
            source: new LocalDataSource({
                things: {
                    0: 'thing: 0',
                    1: 'thing: 1',
                    2: 'thing: 2'
                }
            }, {
                wait: 0, // wait: 0 means setTimeout 0
                onGet: onGet
            })
        });
        var partDone = after(2, done);

        model.get(['things', { from: 0, to: 1 }]).subscribe(function(response) {
            expect(onGet.calledOnce).to.equal(true);
            expect(onGet.getCall(0).args[1]).to.deep.equal([[ 'things', { from: 0, to: 1 } ]]);
            expect(strip(response.json)).to.deep.equal({
                things: {
                    0: 'thing: 0',
                    1: 'thing: 1'
                }
            });
        }, done, partDone);
        model.get(['things', { from: 1, to: 2 }]).subscribe(function(response) {
            expect(onGet.calledTwice).to.equal(true);
            expect(onGet.getCall(1).args[1]).to.deep.equal([[ 'things', '2' ]]);
            expect(strip(response.json)).to.deep.equal({
                things: {
                    1: 'thing: 1',
                    2: 'thing: 2'
                }
            });
        }, done, partDone);
    });

    it('should dedupe from both ends of overlapping ranges', function(done) {
        var onGet = sinon.spy();
        var model = new falcor.Model({
            source: new LocalDataSource({
                things: {
                    0: 'thing: 0',
                    1: 'thing: 1',
                    2: 'thing: 2',
                    3: 'thing: 3',
                    4: 'thing: 4',
                }
            }, {
                wait: 0,
                onGet: onGet
            })
        });
        var partDone = after(2, done);

        model.get(['things', { from: 1, to: 2 }]).subscribe(function(response) {
            expect(onGet.getCall(0).args[1]).to.deep.equal([[ 'things', { from: 1, to: 2 } ]]);
        }, done, partDone);
        model.get(['things', { from: 0, to: 4 }]).subscribe(function(response) {
            expect(onGet.getCall(1).args[1]).to.deep.equal([[ 'things', [0, 3, 4] ]]);
        }, done, partDone);
    });

    it('should leave ranges unrolled if possible', function(done) {
        var onGet = sinon.spy();
        var model = new falcor.Model({
            source: new LocalDataSource({
                things: {
                    0: 'thing: 0',
                    1: 'thing: 1',
                    2: 'thing: 2',
                    3: 'thing: 3',
                    4: 'thing: 4',
                }
            }, {
                wait: 0,
                onGet: onGet
            })
        });
        var partDone = after(2, done);

        model.get(['things', { from: 0, to: 2 }]).subscribe(noOp, done, partDone);
        model.get(['things', { from: 0, to: 4 }]).subscribe(function(response) {
            expect(onGet.getCall(1).args[1]).to.deep.equal([[ 'things', { from: 3, to: 4 } ]]);
        }, done, partDone);
    });

    it('should work for properties after ranges', function(done) {
        var onGet = sinon.spy();
        var model = new falcor.Model({
            source: new LocalDataSource({
                things: {
                    0: { name: 'thing: 0' },
                    1: { name: 'thing: 1' },
                    2: { name: 'thing: 2' },
                }
            }, {
                wait: 0,
                onGet: onGet
            })
        });
        var partDone = after(2, done);

        model.get(['things', { from: 0, to: 1 }, 'name']).subscribe(noOp, done, partDone);
        model.get(['things', { from: 1, to: 2 }, 'name']).subscribe(function() {
            expect(onGet.getCall(1).args[1]).to.deep.equal([[ 'things', 2, 'name' ]]);
        }, done, partDone);
    });

    it('should work for multiple ranges in path sets', function(done) {
        var onGet = sinon.spy();
        var model = new falcor.Model({
            source: new LocalDataSource({
                things: {
                    0: { name: 'thing: 0', tags: { 0: 't0 tag: 0', 1: 't0 tag: 1', 2: 't0 tag: 2' } },
                    1: { name: 'thing: 1', tags: { 0: 't1 tag: 0', 1: 't1 tag: 1', 2: 't1 tag: 2' } },
                    2: { name: 'thing: 2', tags: { 0: 't2 tag: 0', 1: 't2 tag: 1', 2: 't2 tag: 2' } },
                }
            }, {
                wait: 0,
                onGet: onGet
            })
        });
        var partDone = after(2, done);

        model.get(['things', { from: 0, to: 1 }, 'tags', { from: 1, to: 2 }]).subscribe(noOp, done, partDone);
        model.get(['things', { from: 0, to: 2 }, 'tags', { from: 0, to: 2 }]).subscribe(function() {
            expect(onGet.getCall(1).args[1]).to.deep.equal([
                ['things', { from: 0, to: 1 }, 'tags', '0'],
                ['things', 2, 'tags', { from: 0, to: 2 }]
            ]);
        }, done, partDone);
    });

    it('should work when different optimized and requested path lengths', function(done) {
        var onGet = sinon.spy();
        var model = new falcor.Model({
            source: new LocalDataSource({
                things: {
                    0: {
                        tags: {
                            0: 't0 tag: 0',
                            1: 't0 tag: 1'
                        }
                    },
                },
                oneoff: {
                    tags: {
                        0: 't2 tag: 0',
                        1: 't2 tag: 1'
                    }
                },
                thang: {
                    that: {
                        really: {
                            is: {
                                a: {
                                    thing: {
                                        of: {
                                            course: {
                                                tags: {
                                                    0: 'thang tag: 0',
                                                    1: 'thang tag: 1' }}}}}}}}}
            }, {
                wait: 0,
                onGet: onGet
            }),
            cache: {
                things: {
                    1: $ref('thang.that.really.is.a.thing.of.course'),
                    2: $ref('oneoff')
                }
            }
        });
        var partDone = after(2, done);

        model.get(['things', 0, 'tags', 0]).subscribe(noOp, done, partDone);
        // path length differences:
        // things[0].tags[0,1] -> requested: 4, optimized: 4
        // things[1].tags[0,1] -> requested: 4, optimized: 10
        // things[2].tags[0,1] -> requested: 4, optimized: 3
        model.get(['things', { from: 0, to: 2 }, 'tags', { from: 0, to: 1 }]).subscribe(function(response) {
            expect(onGet.getCall(1).args[1]).to.deep.equal([
                ['oneoff', 'tags', { from: 0, to: 1 }],
                ['things', 0, 'tags', '1'],
                ['thang', 'that', 'really', 'is', 'a', 'thing', 'of', 'course', 'tags', { from: 0, to: 1 }]
            ]);
        }, done, partDone);
    });
});

