var getCoreRunner = require('./../getCoreRunner');
var jsonGraph = require('falcor-json-graph');
var atom = jsonGraph.atom;
var ref = jsonGraph.ref;
var NullInPathError = require('./../../lib/errors/NullInPathError');
var expect = require('chai').expect;

describe('Nulls', function() {
    it('should allow null at end of path.', function() {
        getCoreRunner({
            input: [['a', null]],
            output: {
                json: {
                    a: 'title'
                }
            },
            cache: {
                a: ref(['b']),
                b: 'title'
            }
        });
    });

    it('should throw an error if null is in middle of path.', function() {
        var error;
        try {
            getCoreRunner({
                input: [['a', null, 'c']],
                output: {
                    json: {
                        a: 'title'
                    }
                },
                cache: {
                    a: ref(['b']),
                    b: {
                        c: 'title'
                    }
                }
            });
        }
        catch (e) {
            error = e;
        }
        finally {
            expect(error instanceof NullInPathError).to.be.ok;
        }
    });
});

