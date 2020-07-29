var del = require("del");

function cleanPerf() {
    return del(["./performance/bin", "./performance/out"]);
}

function cleanDoc() {
    return del(["./doc"]);
}

function cleanBin() {
    return del(["./bin"]);
}

function cleanDist() {
    return del(["./dist"]);
}

function cleanCoverage() {
    return del(["./coverage"]);
}

module.exports = {
    bin: cleanBin,
    coverage: cleanCoverage,
    dist: cleanDist,
    doc: cleanDoc,
    perf: cleanPerf,
};
