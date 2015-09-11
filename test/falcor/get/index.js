var Model = require('./../../../lib').Model;
var expect = require('chai').expect;
var sinon = require('sinon');
var ModelResponse = require('./../../../lib/response/ModelResponse');
var atom = Model.atom;
var InvalidModelError = require('./../../../lib/errors/InvalidModelError');

describe('Get', function() {
    require('./get.cache-only.spec');
    require('./get.dataSource-only.spec');
    require('./get.dataSource-and-cache.spec');
    require('./get.dataSource-and-bind.spec');
    require('./get.cacheAsDataSource.spec');
    require('./get.pathSyntax.spec');
    require('./get.getCache.spec');
    require('./get.clone.spec');
    require('./get.gen.spec');
});
