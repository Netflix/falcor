module.exports = function(config) {

  config.set({
    // base path, that will be used to resolve files and exclude
    basePath: './',

    frameworks: ['benchmark'],

    plugins: [
        'karma-benchmark',
        'karma-junit-reporter',
        'karma-chrome-launcher',
        'karma-firefox-launcher',
        'karma-safari-launcher',
        require('./reporters/karmaBenchmarkCSVReporter'),
    ],

    customLaunchers: {
      ChromeForceGC: {
        base: 'Chrome',
        flags: ['--js-flags="--expose_gc"']
      }
    },

    // use dots reporter, as travis terminal does not support escaping sequences
    // possible values: 'dots', 'progress'
    // CLI --reporters progress
    reporters: [
        'benchmarkcsv',
        'junit'
    ],

    // list of files / patterns to load in the browser
    files: [
        'bin/browser.js'
    ],

    // list of files to exclude
    exclude: [
    ],

    // web server port
    // CLI --port 9876
    port: 9876,

    // enable / disable colors in the output (reporters and logs)
    // CLI --colors --no-colors
    colors: true,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    // CLI --log-level debug
    logLevel: config.LOG_INFO,

    // enable / disable watching file and executing tests whenever any file changes
    // CLI --auto-watch --no-auto-watch
    autoWatch: false,

    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera
    // - Safari (only Mac)
    // - PhantomJS
    // - IE (only Windows)
    // CLI --browsers Chrome,Firefox,Safari
    browsers: [
      'ChromeForceGC'
    ],

    // Serve html files using html2js
    preprocessors: {
    },

    // Configure the jUnit reporter
    junitReporter: {
      outputDir: 'out',
      outputFile: 'junit-benchmark.xml',
      suite: 'Perf Tests'
    },

    benchmarkCSVReporter: {
      outputFile: 'out/browser-benchmark.csv'
    },

    // If browser does not capture in given timeout [ms], kill it
    // CLI --capture-timeout 5000
    captureTimeout: 30000,

    browserNoActivityTimeout: 30000,

    // Auto run tests on start (when browsers are captured) and exit
    // CLI --single-run --no-single-run
    // singleRun: false,
    singleRun: true,

    // report which specs are slower than 500ms
    // CLI --report-slower-than 500
    reportSlowerThan: 30000
  });
};
