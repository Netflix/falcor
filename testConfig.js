function startTesting(model, recModel, E_model, E_recModel) {
    function asJSONModel() {
        E_model._getPathsAsJSON(E_model, [
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

    function asJSONRecModel() {
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
    function asPathMapModel() {
        E_model._getPathsAsPathMap(E_model, [
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

    function asPathMapRecModel() {
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
    function asValuesModel() {
        E_model._getPathsAsValues(E_model, [
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

    function asValuesRecModel() {
        E_recModel._getAsValues(E_recModel, [
            ["startup"], ["appconfig"], ["languages"], ["geolocation"], ["user"], ["uiexperience"], ["lolomo", "summary"], ["lolomo", {"to": 60}, "summary"], ["lolomo", 0, "billboardData"], ["lolomo", 0, 0, "postcard"], ["profilesList", {"to": 4}, "avatar", "images", "byWidth", [32, 64, 80, 100, 112, 160, 200, 320]], ["profilesList", {"to": 4}, "summary"], ["profilesList", "summary"], ["profilesList", "availableAvatarsList", {"to": 18}, "images", "byWidth", [32, 64, 80, 100, 112, 160, 200, 320]], ["profilesList", "availableAvatarsList", {"to": 18}, "summary"], ["profilesList", "availableAvatarsList", "summary"], ["profiles", "hasSeenPromoGate"], ["lolomo", "maxExperience"], ["lolomo", 0, 0, "evidence"], ["lolomo", 0, 0, "item", ["info", "summary", "outline", "rating", "heroImages"]]
        ]);
    }

    function asJSONModelFilled() {
        model._getPathsAsJSON(model, [
            ["lists", "abcd", {"from": 0, "to": 10}, "summary"],
            ["lists", "abcd", {"from": 11, "to": 20}, "summary"],
            ["lists", "abcd", {"from": 21, "to": 30}, "summary"],
            ["lists", "abcd", {"from": 31, "to": 40}, "summary"]
        ], [{},{},{},{}]);
    }

    function asJSONRecModelFilled() {
        recModel._getAsJSON(recModel, [
            ["lists", "abcd", {"from": 0, "to": 10}, "summary"],
            ["lists", "abcd", {"from": 11, "to": 20}, "summary"],
            ["lists", "abcd", {"from": 21, "to": 30}, "summary"],
            ["lists", "abcd", {"from": 31, "to": 40}, "summary"]
        ], [{},{},{},{}]);
    }
    function asPathMapModelFilled() {
        model._getPathsAsPathMap(model, [
            ["lists", "abcd", {"from": 0, "to": 10}, "summary"],
            ["lists", "abcd", {"from": 11, "to": 20}, "summary"],
            ["lists", "abcd", {"from": 21, "to": 30}, "summary"],
            ["lists", "abcd", {"from": 31, "to": 40}, "summary"]
        ], [{}]);
    }

    function asPathMapRecModelFilled() {
        recModel._getAsPathMap(recModel, [
            ["lists", "abcd", {"from": 0, "to": 10}, "summary"],
            ["lists", "abcd", {"from": 11, "to": 20}, "summary"],
            ["lists", "abcd", {"from": 21, "to": 30}, "summary"],
            ["lists", "abcd", {"from": 31, "to": 40}, "summary"]
        ], [{}]);
    }
    function asValuesModelFilled() {
        model._getPathsAsValues(model, [
            ["lists", "abcd", {"from": 0, "to": 10}, "summary"],
            ["lists", "abcd", {"from": 11, "to": 20}, "summary"],
            ["lists", "abcd", {"from": 21, "to": 30}, "summary"],
            ["lists", "abcd", {"from": 31, "to": 40}, "summary"]
        ]);
    }

    function asValuesRecModelFilled() {
        recModel._getAsValues(recModel, [
            ["lists", "abcd", {"from": 0, "to": 10}, "summary"], ["lists", "abcd", {"from": 11, "to": 20}, "summary"], ["lists", "abcd", {"from": 21, "to": 30}, "summary"], ["lists", "abcd", {"from": 31, "to": 40}, "summary"]
        ]);
    }
    
    function asValuesSimple() {
        model._getPathsAsValues(model, [
            ['videos', 1234, 'summary']
        ]);
    }
    function asValuesSimpleRec() {
        recModel._getAsValues(recModel, [
            ['videos', 1234, 'summary']
        ]);
    }
    function asJSONSimple() {
        model._getPathsAsJSON(model, [
            ['videos', 1234, 'summary']
        ], [{}]);
    }
    function asJSONSimpleRec() {
        recModel._getAsJSON(recModel, [
            ['videos', 1234, 'summary']
        ], [{}]);
    }
    function asPathMapSimple() {
        model._getPathsAsPathMap(model, [
            ['videos', 1234, 'summary']
        ], [{}]);
    }
    function asPathMapSimpleRec() {
        recModel._getAsPathMap(recModel, [
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
    return {
        name: 'Falcor',
        async: false,
        tests: {
            'falcor.Model getValueSync simple 1': getValueSync,
            'falcor.Model getValueSync simple 2': getValueSync,
            'falcor.Model getValueSync simple 3': getValueSync,
            'falcor.Model getValueSync simple 4': getValueSync,
            'falcor.Model getValueSync simple 5': getValueSync,
            'falcor.Model getValueSync simple 6': getValueSync,
            'falcor.Model getValueSync simple 7': getValueSync,
            'falcor.Model getValueSync simple 8': getValueSync,
            'falcor.Model getValueSync simple 9': getValueSync,
            'falcor.Model getValueSync simple 10': getValueSync
//            'FTester2.Model getValueSync simple': getValueSyncRec,
//            'falcor.Model getValueSync reference': getReferenceSync,
//            'FTester2.Model getValueSync reference': getReferenceSyncRec
//            'falcor.Model simple path AsValues': asValuesSimple,
//            'FTester2.Model simple path AsValues': asValuesSimpleRec,
//            'falcor.Model simple path AsJSON': asJSONSimple,
//            'FTester2.Model simple path AsJSON': asJSONSimpleRec,
//            'falcor.Model simple path AsPathMap': asPathMapSimple,
//            'FTester2.Model simple path AsPathMap': asPathMapSimpleRec
//            'falcor.Model startup request AsJSON': asJSONModel,
//            'FTester2.Model startup request AsJSON': asJSONRecModel,
//            'falcor.Model startup request AsPathMap': asPathMapModel,
//            'FTester2.Model startup request AsPathMap': asPathMapRecModel,
//            'falcor.Model startup request AsValues': asValuesModel,
//            'FTester2.Model startup request AsValues': asValuesRecModel
//            'falcor.Model scrolling the lolomo request pattern AsJSON': asJSONModelFilled,
//            'FTester2.Model scrolling the lolomo request pattern AsJSON': asJSONRecModelFilled,
//            'falcor.Model scrolling the lolomo request pattern AsPathMap': asPathMapModelFilled,
//            'FTester2.Model scrolling the lolomo request pattern AsPathMap': asPathMapRecModelFilled,
//            'falcor.Model scrolling the lolomo request pattern AsValues': asValuesModelFilled,
//            'FTester2.Model scrolling the lolomo request pattern AsValues': asValuesRecModelFilled
        }
    };
}

if (typeof module !== 'undefined') {
    module.exports = startTesting;
}

