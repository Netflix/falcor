var falcor = require('../../..');
var assert = require('assert');

describe('_setValueSync', function() {
  var model;
  beforeEach(function() {
    model = falcor({ _path: ['some'], cache: { some: { thing: '1'}}});
  });

  it('sets value in cache synchronously', function() {
    model._setValueSync(['thing'], '2');
    assert.equal(model.getCache().some.thing, '2');
  });

  it('returns the value from cache', function() {
    assert.equal(model._setValueSync(['thing'], '2'), '2')
  });

  it('is symmetrical with _getValueSync', function() {
    model._setValueSync(['thing'], '2');
    assert.equal(model._getValueSync(['thing']), '2');
  });
});
