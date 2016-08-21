var getCoreRunner = require('./../getCoreRunner');
var jsonGraph = require('falcor-json-graph');
var atom = jsonGraph.atom;
var ref = jsonGraph.ref;
var NullInPathError = require('./../../lib/errors/NullInPathError');
var NullInPathToBranchError = require('./../../lib/errors/NullInPathToBranchError');
var expect = require('chai').expect;

describe('Nulls', function() {
    describe('JSON', function() {
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
                    output: { },
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

        it('should throw if null at end of path but reference points to a branch node.', function() {
            var error;
            try {
                getCoreRunner({
                    input: [['a', null]],
                    output: { },
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
                expect(error instanceof NullInPathToBranchError).to.be.ok;
            }
        });
    });

    describe('JSONGraph', function() {
        it('should allow null at end of path.', function() {
            getCoreRunner({
                isJSONG: true,
                input: [['a', null]],
                output: {
                    paths: [['a', null]],
                    jsonGraph: {
                        a: ref(['b']),
                        b: 'title'
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
                    isJSONG: true,
                    input: [['a', null, 'c']],
                    output: { },
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

        it('should throw if null at end of path but reference points to a branch node.', function() {
            var error;
            try {
                getCoreRunner({
                    isJSONG: true,
                    input: [['a', null]],
                    output: {
                        jsonGraph: {
                            a: ref(['b'])
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
                expect(error instanceof NullInPathToBranchError).to.be.ok;
            }
        });
    });
});

