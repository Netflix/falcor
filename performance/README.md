# Running Performance Tests

* `gulp run perf`

       Runs performance tests on configured browsers, and NodeJS, after building bundles.

* `gulp perf-all`

       Build bundles for browser/device testing.

Browser tests are run through Karma, which should be installed locally as an npm devDependency.

All results will be saved to CSV files in the `performance/out` directory.

## More Fine Grained Control

To run tests on other browsers:

`karma start --browsers=[comma separated list of browsers]`

For example:

`karma start --browsers=Firefox, Chrome`

It's worth noting that running performance tests in parallel on multiple browsers may impact results.

# Updating Performance Tests

* `performance/browser.js`

       Defines the tests and configuration to use for browser performance tests.

* `performance/node.js`

       Defines the tests and configuration to use for NodeJS performance tests.

