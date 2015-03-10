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

    function asJSONScrollingGallery() {
        model._getPathsAsJSON(model, [
            ["lists", "abcd", {"from": 0, "to": 10}, "summary"],
            ["lists", "abcd", {"from": 11, "to": 20}, "summary"],
            ["lists", "abcd", {"from": 21, "to": 30}, "summary"],
            ["lists", "abcd", {"from": 31, "to": 40}, "summary"]
        ], [{},{},{},{}]);
    }

    function asJSONRecScrollingGallery() {
        recModel._getAsJSON(recModel, [
            ["lists", "abcd", {"from": 0, "to": 10}, "summary"],
            ["lists", "abcd", {"from": 11, "to": 20}, "summary"],
            ["lists", "abcd", {"from": 21, "to": 30}, "summary"],
            ["lists", "abcd", {"from": 31, "to": 40}, "summary"]
        ], [{},{},{},{}]);
    }
    function asPathMapScrollingGallery() {
        model._getPathsAsPathMap(model, [
            ["lists", "abcd", {"from": 0, "to": 10}, "summary"],
            ["lists", "abcd", {"from": 11, "to": 20}, "summary"],
            ["lists", "abcd", {"from": 21, "to": 30}, "summary"],
            ["lists", "abcd", {"from": 31, "to": 40}, "summary"]
        ], [{}]);
    }

    function asPathMapRecScrollingGallery() {
        recModel._getAsPathMap(recModel, [
            ["lists", "abcd", {"from": 0, "to": 10}, "summary"],
            ["lists", "abcd", {"from": 11, "to": 20}, "summary"],
            ["lists", "abcd", {"from": 21, "to": 30}, "summary"],
            ["lists", "abcd", {"from": 31, "to": 40}, "summary"]
        ], [{}]);
    }
    function asValuesScrollingGallery() {
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
    var config = {
        name: 'Falcor',
        async: false,
        tests: {}
    };
    
    repeatInConfig('falcor.Model scrolling lolomo', 15, asJSONScrollingGallery, config.tests);
    
    return config;
}

function repeatInConfig(name, count, test, config) {
    for (var i = 0; i < count; i++) {
        config[name + ' ' + i] = test;
    }
}

if (typeof module !== 'undefined') {
    module.exports = startTesting;
}

