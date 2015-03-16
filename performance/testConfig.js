var falcor = require('./bin/falcor.s.js');
var recF = require('./bin/falcor.r.js');
var Cache = require('./../test/data/Cache');
E_model = new falcor.Model();
E_recModel = new recF.Model();
model = new falcor.Model({cache: Cache()});
recModel = new recF.Model({cache: Cache()});

function startupJSONModel() {
    E_model._getPathSetsAsJSON(E_model, [
        ["startup"],
        ["appconfig"],
        ["languages"],
        ["geolocation"],
        ["user"],
        ["uiexperience"],
        ["lolomo", "summary"],
        ["lolomo", {"to": 60}, "summary"],
        ["lolomo", 0, "billboardData"],
        ["lolomo", 0, 0, "postcard"],
        ["profilesList", {"to": 4}, "avatar", "images", "byWidth", [32, 64, 80, 100, 112, 160, 200, 320]],
        ["profilesList", {"to": 4}, "summary"],
        ["profilesList", "summary"],
        ["profilesList", "availableAvatarsList", {"to": 18}, "images", "byWidth", [32, 64, 80, 100, 112, 160, 200, 320]],
        ["profilesList", "availableAvatarsList", {"to": 18}, "summary"],
        ["profilesList", "availableAvatarsList", "summary"],
        ["profiles", "hasSeenPromoGate"],
        ["lolomo", "maxExperience"],
        ["lolomo", 0, 0, "evidence"],
        ["lolomo", 0, 0, "item", ["info", "summary", "outline", "rating", "heroImages"]]
    ], [{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{}]);
}

function startupJSONRecModel() {
    E_recModel._getAsJSON(E_recModel, [
        ["startup"],
        ["appconfig"],
        ["languages"],
        ["geolocation"],
        ["user"],
        ["uiexperience"],
        ["lolomo", "summary"],
        ["lolomo", {"to": 60}, "summary"],
        ["lolomo", 0, "billboardData"],
        ["lolomo", 0, 0, "postcard"],
        ["profilesList", {"to": 4}, "avatar", "images", "byWidth", [32, 64, 80, 100, 112, 160, 200, 320]],
        ["profilesList", {"to": 4}, "summary"],
        ["profilesList", "summary"],
        ["profilesList", "availableAvatarsList", {"to": 18}, "images", "byWidth", [32, 64, 80, 100, 112, 160, 200, 320]],
        ["profilesList", "availableAvatarsList", {"to": 18}, "summary"],
        ["profilesList", "availableAvatarsList", "summary"],
        ["profiles", "hasSeenPromoGate"],
        ["lolomo", "maxExperience"],
        ["lolomo", 0, 0, "evidence"],
        ["lolomo", 0, 0, "item", ["info", "summary", "outline", "rating", "heroImages"]]
    ], [{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{}]);
}
function startupPathMapModel() {
    E_model._getPathSetsAsPathMap(E_model, [
        ["startup"],
        ["appconfig"],
        ["languages"],
        ["geolocation"],
        ["user"],
        ["uiexperience"],
        ["lolomo", "summary"],
        ["lolomo", {"to": 60}, "summary"],
        ["lolomo", 0, "billboardData"],
        ["lolomo", 0, 0, "postcard"],
        ["profilesList", {"to": 4}, "avatar", "images", "byWidth", [32, 64, 80, 100, 112, 160, 200, 320]],
        ["profilesList", {"to": 4}, "summary"],
        ["profilesList", "summary"],
        ["profilesList", "availableAvatarsList", {"to": 18}, "images", "byWidth", [32, 64, 80, 100, 112, 160, 200, 320]],
        ["profilesList", "availableAvatarsList", {"to": 18}, "summary"],
        ["profilesList", "availableAvatarsList", "summary"],
        ["profiles", "hasSeenPromoGate"],
        ["lolomo", "maxExperience"],
        ["lolomo", 0, 0, "evidence"],
        ["lolomo", 0, 0, "item", ["info", "summary", "outline", "rating", "heroImages"]]
    ], [{}]);
}

function startupPathMapRecModel() {
    E_recModel._getAsPathMap(E_recModel, [
        ["startup"],
        ["appconfig"],
        ["languages"],
        ["geolocation"],
        ["user"],
        ["uiexperience"],
        ["lolomo", "summary"],
        ["lolomo", {"to": 60}, "summary"],
        ["lolomo", 0, "billboardData"],
        ["lolomo", 0, 0, "postcard"],
        ["profilesList", {"to": 4}, "avatar", "images", "byWidth", [32, 64, 80, 100, 112, 160, 200, 320]],
        ["profilesList", {"to": 4}, "summary"],
        ["profilesList", "summary"],
        ["profilesList", "availableAvatarsList", {"to": 18}, "images", "byWidth", [32, 64, 80, 100, 112, 160, 200, 320]],
        ["profilesList", "availableAvatarsList", {"to": 18}, "summary"],
        ["profilesList", "availableAvatarsList", "summary"],
        ["profiles", "hasSeenPromoGate"],
        ["lolomo", "maxExperience"],
        ["lolomo", 0, 0, "evidence"],
        ["lolomo", 0, 0, "item", ["info", "summary", "outline", "rating", "heroImages"]]
    ], [{}]);
}
function startupValuesModel() {
    E_model._getPathSetsAsValues(E_model, [
        ["startup"],
        ["appconfig"],
        ["languages"],
        ["geolocation"],
        ["user"],
        ["uiexperience"],
        ["lolomo", "summary"],
        ["lolomo", {"to": 60}, "summary"],
        ["lolomo", 0, "billboardData"],
        ["lolomo", 0, 0, "postcard"],
        ["profilesList", {"to": 4}, "avatar", "images", "byWidth", [32, 64, 80, 100, 112, 160, 200, 320]],
        ["profilesList", {"to": 4}, "summary"],
        ["profilesList", "summary"],
        ["profilesList", "availableAvatarsList", {"to": 18}, "images", "byWidth", [32, 64, 80, 100, 112, 160, 200, 320]],
        ["profilesList", "availableAvatarsList", {"to": 18}, "summary"],
        ["profilesList", "availableAvatarsList", "summary"],
        ["profiles", "hasSeenPromoGate"],
        ["lolomo", "maxExperience"],
        ["lolomo", 0, 0, "evidence"],
        ["lolomo", 0, 0, "item", ["info", "summary", "outline", "rating", "heroImages"]]
    ]);
}

function startupValuesRecModel() {
    E_recModel._getPathSetsAsValues(E_recModel, [
        ["startup"], ["appconfig"], ["languages"], ["geolocation"], ["user"], ["uiexperience"], ["lolomo", "summary"], ["lolomo", {"to": 60}, "summary"], ["lolomo", 0, "billboardData"], ["lolomo", 0, 0, "postcard"], ["profilesList", {"to": 4}, "avatar", "images", "byWidth", [32, 64, 80, 100, 112, 160, 200, 320]], ["profilesList", {"to": 4}, "summary"], ["profilesList", "summary"], ["profilesList", "availableAvatarsList", {"to": 18}, "images", "byWidth", [32, 64, 80, 100, 112, 160, 200, 320]], ["profilesList", "availableAvatarsList", {"to": 18}, "summary"], ["profilesList", "availableAvatarsList", "summary"], ["profiles", "hasSeenPromoGate"], ["lolomo", "maxExperience"], ["lolomo", 0, 0, "evidence"], ["lolomo", 0, 0, "item", ["info", "summary", "outline", "rating", "heroImages"]]
    ]);
}

function asJSONScrollingGallery() {
    model._getPathSetsAsJSON(model, [
        ["lists", "abcd", {"from": 0, "to": 10}, "summary"],
        ["lists", "abcd", {"from": 11, "to": 20}, "summary"],
        ["lists", "abcd", {"from": 21, "to": 30}, "summary"],
        ["lists", "abcd", {"from": 31, "to": 40}, "summary"]
    ], [{},{},{},{}]);
}

function asJSONRecScrollingGallery() {
    recModel._getPathSetsAsJSON(recModel, [
        ["lists", "abcd", {"from": 0, "to": 10}, "summary"],
        ["lists", "abcd", {"from": 11, "to": 20}, "summary"],
        ["lists", "abcd", {"from": 21, "to": 30}, "summary"],
        ["lists", "abcd", {"from": 31, "to": 40}, "summary"]
    ], [{},{},{},{}]);
}
function asPathMapScrollingGallery() {
    model._getPathSetsAsPathMap(model, [
        ["lists", "abcd", {"from": 0, "to": 10}, "summary"],
        ["lists", "abcd", {"from": 11, "to": 20}, "summary"],
        ["lists", "abcd", {"from": 21, "to": 30}, "summary"],
        ["lists", "abcd", {"from": 31, "to": 40}, "summary"]
    ], [{}]);
}

function asPathMapRecScrollingGallery() {
    recModel._getPathSetsAsPathMap(recModel, [
        ["lists", "abcd", {"from": 0, "to": 10}, "summary"],
        ["lists", "abcd", {"from": 11, "to": 20}, "summary"],
        ["lists", "abcd", {"from": 21, "to": 30}, "summary"],
        ["lists", "abcd", {"from": 31, "to": 40}, "summary"]
    ], [{}]);
}
function asValuesScrollingGallery() {
    model._getPathSetsAsValues(model, [
        ["lists", "abcd", {"from": 0, "to": 10}, "summary"],
        ["lists", "abcd", {"from": 11, "to": 20}, "summary"],
        ["lists", "abcd", {"from": 21, "to": 30}, "summary"],
        ["lists", "abcd", {"from": 31, "to": 40}, "summary"]
    ]);
}

function asValuesRecModelFilled() {
    recModel._getPathSetsAsValues(recModel, [
        ["lists", "abcd", {"from": 0, "to": 10}, "summary"], ["lists", "abcd", {"from": 11, "to": 20}, "summary"], ["lists", "abcd", {"from": 21, "to": 30}, "summary"], ["lists", "abcd", {"from": 31, "to": 40}, "summary"]
    ]);
}

function asValuesSimple() {
    model._getPathSetsAsValues(model, [
        ['videos', 1234, 'summary']
    ]);
}
function asValuesSimpleRec() {
    recModel._getPathSetsAsValues(recModel, [
        ['videos', 1234, 'summary']
    ]);
}
function asJSONSimple() {
    model._getPathSetsAsJSON(model, [
        ['videos', 1234, 'summary']
    ], [{}]);
}
function asJSONSimpleRec() {
    recModel._getPathSetsAsJSON(recModel, [
        ['videos', 1234, 'summary']
    ], [{}]);
}
function asJSONReference() {
    model._getPathSetsAsJSON(model, [
        ['genreList', 0, 0, 'summary']
    ], [{}]);
}
function asJSONReferenceRec() {
    recModel._getPathSetsAsJSON(recModel, [
        ['genreList', 0, 0, 'summary']
    ], [{}]);
}
function asPathMapSimple() {
    model._getPathSetsAsPathMap(model, [
        ['videos', 1234, 'summary']
    ], [{}]);
}
function asPathMapSimpleRec() {
    recModel._getPathSetsAsPathMap(recModel, [
        ['videos', 1234, 'summary']
    ], [{}]);
}
function getValueSyncRec() {
    recModel.getValueSync(['videos', 1234, 'summary']);
}
function getValueSync() {
    model.getValueSync(['videos', 1234, 'summary']);
}
function getReferenceSyncRec() {
    recModel.getValueSync(['genreList', 0, 0, 'summary']);
}
function getReferenceSync() {
    model.getValueSync(['genreList', 0, 0, 'summary']);
}
function repeatInConfig(name, count, test, config) {
    for (var i = 0; i < count; i++) {
        config[name + ' ' + i] = test;
    }
}

module.exports = function() {
    var config = {
        name: 'Falcor',
        async: false,
        tests: {}
    };
    return {
        config: config,
        repeatInConfig: repeatInConfig,
        startupJSONModel: startupJSONModel,
        startupJSONRecModel: startupJSONRecModel,
        startupPathMapModel: startupPathMapModel,
        startupPathMapRecModel: startupPathMapRecModel,
        startupValuesModel: startupValuesModel,
        startupValuesRecModel: startupValuesRecModel,
        galleryJSON: asJSONScrollingGallery,
        galleryJSONRec: asJSONRecScrollingGallery,
        galleryPathMap: asPathMapScrollingGallery,
        galleryPathMapRec: asPathMapRecScrollingGallery,
        simpleJSON: asJSONSimple,
        simpleJSONRec: asJSONSimpleRec,
        simplePathMap: asPathMapSimple,
        simplePathMapRec: asPathMapSimpleRec,
        simpleValues: asValuesSimple,
        simpleValuesRec: asValuesSimpleRec,
        referenceJSON: asJSONReference,
        referenceJSONRec: asJSONReferenceRec
    };
};
