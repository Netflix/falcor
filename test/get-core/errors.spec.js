var getCoreRunner = require('./../getCoreRunner');
var cacheGenerator = require('./../CacheGenerator');
var toTree = require('falcor-path-utils').toTree;
var jsonGraph = require('falcor-json-graph');
var ref = jsonGraph.ref;
var error = jsonGraph.error;
var _ = require('lodash');

describe('Errors', function() {
    var expired = error('expired');
    expired.$expires = Date.now() - 1000;

    var fooBranch = function() {
        return {
            $__path: ['foo'],
            bar: {
                $__path: ['foo', 'bar'],
                baz: {
                    $__path: ['foo', 'bar', 'baz'],
                    qux: 'qux'
                }
            }
        };
    };

    var errorCache = function() {
        return {
            reference: ref(['to', 'error']),
            to: {
                error: error('Oops!'),
                expired: expired,
                title: 'Hello World'
            },
            list: {
                0: ref(['to']),
                1: ref(['to', 'error'])
            },
            foo: {
                bar: {
                    baz: {
                        qux: 'qux'
                    }
                }
            }
        };
    };

    it('should report error with path.', function() {
        getCoreRunner({
            input: [['to', 'error']],
            output: {
                json: {
                    to: {}
                }
            },
            errors: [{
                path: ['to', 'error'],
                value: 'Oops!'
            }],
            cache: errorCache
        });
    });
    it('should report error with path when reusing walk arrays.', function() {
        getCoreRunner({
            input: [
                ['foo', 'bar', 'baz', 'qux'],
                ['to', 'error']
            ],
            output: {
                json: {
                    foo: fooBranch(),
                    to: {}
                }
            },
            errors: [{
                path: ['to', 'error'],
                value: 'Oops!'
            }],
            cache: errorCache
        });
    });
    it('should report error path with null from reference.', function() {
        getCoreRunner({
            input: [['reference', 'title']],
            output: {
                json: {
                    reference: {}
                }
            },
            errors: [{
                path: ['reference', null],
                value: 'Oops!'
            }],
            cache: errorCache
        });
    });
    it('should report error path with null from reference with path ending in null.', function() {
        getCoreRunner({
            input: [['reference', null]],
            output: {
                json: {
                    reference: {}
                }
            },
            errors: [{
                path: ['reference', null],
                value: 'Oops!'
            }],
            cache: errorCache
        });
    });
    it('should report error with path in treateErrorsAsValues.', function() {
        var to = {
            error: 'Oops!'
        };
        to.$__path = ['to'];
        getCoreRunner({
            input: [['to', 'error']],
            output: {
                json: {
                    to: to
                }
            },
            treatErrorsAsValues: true,
            cache: errorCache
        });
    });
    it('should report error path with null from reference in treatErrorsAsValues.', function() {
        getCoreRunner({
            input: [['reference', 'title']],
            output: {
                json: {
                    reference: 'Oops!'
                }
            },
            treatErrorsAsValues: true,
            cache: errorCache
        });
    });
    it('should report error with path in treatErrorsAsValues when reusing walk arrays.', function() {
        var to = {
            error: 'Oops!'
        };
        to.$__path = ['to'];
        getCoreRunner({
            input: [
                ['foo', 'bar', 'baz', 'qux'],
                ['to', 'error']
            ],
            output: {
                json: {
                    foo: fooBranch(),
                    to: to
                }
            },
            treatErrorsAsValues: true,
            cache: errorCache
        });
    });
    it('should report error with path in treateErrorsAsValues and boxValues.', function() {
        var to = {
            error: error('Oops!')
        };
        to.$__path = ['to'];
        getCoreRunner({
            input: [['to', 'error']],
            output: {
                json: {
                    to: to
                }
            },
            treatErrorsAsValues: true,
            boxValues: true,
            cache: errorCache
        });
    });
    it('should report error path with null from reference in treatErrorsAsValues and boxValues.', function() {
        getCoreRunner({
            input: [['reference', 'title']],
            output: {
                json: {
                    reference: error('Oops!')
                }
            },
            treatErrorsAsValues: true,
            boxValues: true,
            cache: errorCache
        });
    });
    it('should not report an expired error.', function() {
        getCoreRunner({
            input: [['to', 'expired']],
            output: { },
            optimizedMissingPaths: [
                ['to', 'expired']
            ],
            cache: errorCache
        });
    });

    it('should report both values and errors when error is less length than value path.', function() {
        var list = {
            0: {
                title: 'Hello World'
            },
            1: {}
        };
        list.$__path = ['list'];
        list[0].$__path = ['to'];
        getCoreRunner({
            input: [
                ['list', {to: 1}, 'title']
            ],
            output: {
                json: {
                    list: list
                }
            },
            errors: [{
                path: ['list', 1, null],
                value: 'Oops!'
            }],
            cache: errorCache
        });
    });
});

