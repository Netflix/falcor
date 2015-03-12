var jsong = require("../../../bin/Falcor");
var Model = jsong.Model;
var Rx = require("rx");
var LocalDataSource = require("../../data/LocalDataSource");
var Cache = require("../../data/Cache");
var ReducedCache = require("../../data/ReducedCache");
var Expected = require("../../data/expected");
var getTestRunner = require("../../getTestRunner");
var testRunner = require("../../testRunner");
var Bound = Expected.Bound;
var chai = require("chai");
var expect = chai.expect;
var noOp = function() {};
var getDataModel = testRunner.getModel;
var _ = require('lodash');

describe('Splice', function() {
    it('should splice expired item.', function(done) {
        var model = new Model({cache: {}});
        model._setPathMapsAsPathMap(model, [{
            expired: {
                $type: 'sentinel',
                $expires: Date.now() + 10,
                value: 'hello'
            }
        }]);

        expect(model._root.__head.value).to.equal('hello');
        expect(model._root.__head.__next).to.be.not.ok;
        expect(model._root.__head.__prev).to.be.not.ok;
        expect(model._root.__tail).to.be.not.ok;
        
        setTimeout(function() {
            try {
                var values = model._getPathsAsJSON(model, [['expired']], [{}]);
                expect(model._root.__head).to.be.not.ok;
                expect(model._root.__tail).to.be.not.ok;
            } catch (e) {
                done(e);
            }
            
            done();
        }, 100);
    });
    
    it('should splice an overwritten item.', function() {
        var model = new Model({cache: {}});
        model._setPathMapsAsPathMap(model, [{
            values: 'you are terminated'
        }]);

        model._setPathMapsAsPathMap(model, [{
            values: {
                nestedValue: 'you are the bestest!'
            }
        }]);

        expect(model._root.__head.value).to.equal('you are the bestest!');
        expect(model._root.__head.__next).to.be.not.ok;
        expect(model._root.__head.__prev).to.be.not.ok;
        expect(model._root.__tail).to.be.not.ok;
    });
});

