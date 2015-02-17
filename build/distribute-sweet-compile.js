var Transform = require("stream").Transform;
var fs = require("fs");
var path = require("path");
var Rx = require("rx");

var readDir = Rx.Observable.fromNodeCallback(fs.readdir);
var readFile = Rx.Observable.fromNodeCallback(fs.readFile);
var writeFile = Rx.Observable.fromNodeCallback(fs.writeFile);
var mkdir = Rx.Observable.fromNodeCallback(fs.mkdir);
var chmod = Rx.Observable.fromNodeCallback(fs.chmod);
var execFn = require("child_process").exec;

function exec(command) {
    return Rx.Observable.create(function(observer) {
        console.log("command", command);
        var execd = execFn(command, function (error, stdout, stderr) {
            if (error) {
                observer.onError(error);
            }
            console.log("out", stdout);
            console.log("err", stderr);
            observer.onNext({
                stdout: stdout,
                stderr: stderr
            });
        });

        execd.on("exit", function (code) {
            console.log("exit");
            observer.onCompleted();
        });
    });
}
module.exports = function() {

    var outStream = new Transform();
    var outDir = path.join(__dirname, "../tmp/framework/compiled_operations");
    var outFile = path.join(__dirname, "../tmp/framework/compile.sh");
    var obs = readDir(path.join(__dirname, "../tmp/framework/operations")).
        selectMany(function(files) {
            var outArray = files.
                reduce(function(acc, command) {
                    var curr = acc[acc.length - 1];
                    if (curr.length > 3) {
                        curr = acc[acc.length] = [];
                    }

                    curr.push(command);
                    return acc;
                }, [[]]).
                map(function(f) {
                    return "node " + path.join(__dirname, "distribute-sweet-compile.js") + " " + f.join(",");
                });
            outArray.splice(outArray.length - 1, 0, "wait");
            var out = outArray.
                reduce(function(acc, next) {
                    var curr = acc[acc.length - 1];
                    var el = curr[curr.length - 1];
                    if (el === "wait") {
                        curr = acc[acc.length] = [];
                    }

                    curr.push(next);
                    return acc;
                }, [[]]).
                reduce(function(acc, group) {
                    return acc + "\n" + group.join(" & \n");
                }, "");
            return writeFile(outFile, "#!/bin/bash \n" + out);
        }).
        selectMany(function() {
            return mkdir(outDir);
        }).
        selectMany(function() {
            return chmod(outFile, "755");
        }).
        selectMany(function() {
            return exec(outFile);
        }).
        subscribe(
            outStream.emit.bind(outStream, "data"),
            function(err) {
                console.log("err: ", err)
            },
            outStream.emit.bind(outStream, "end")
    );
    return outStream;
};

if (require.main === module) {
    var sweet = require("sweet.js");
    var cachedModules = [
        sweet.loadNodeModule(path.join(__dirname, "../tmp/framework"), "./macros.sjs.js")
    ];

    Rx.Observable.
        fromArray(process.argv[2].split(",")).
        selectMany(function(f) {
            return readFile(path.join(__dirname, "../tmp/framework/operations", f)).
                selectMany(function(contents) {
                    var code = sweet.compile(contents, {
                        sourceMap: false,
                        modules: cachedModules,
                        readableNames: true
                    });
                    return writeFile(path.join(__dirname, "../tmp/framework/compiled_operations", f), code.code);
                });
        }).subscribe();
}
