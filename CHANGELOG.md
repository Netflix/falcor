2.0.0
------------------

## Features
- [Dedupe requests partially with existing requests](https://github.com/Netflix/falcor/pull/897)
- [Add missing paths information when raising
  MaxRetryExceededError](https://github.com/Netflix/falcor/pull/874)

## Bugs
- [Fix "expires: 0" metadata on atoms](https://github.com/Netflix/falcor/pull/905/commits)
- [Protect against model.invalidate from destroying cache](https://github.com/Netflix/falcor/pull/903)
- [Fix retry count logic](https://github.com/Netflix/falcor/pull/904)

1.1.0
-------------------

## Bugs
- [Fix maxRetries on clone](https://github.com/Netflix/falcor/pull/917)
- [Disables whole-branch response merging](https://github.com/Netflix/falcor/pull/920)
- Fix model.set claiming objects passed as argument

1.0.0
-------------------

## Features
- [Allow errorSelector to change $type](https://github.com/Netflix/falcor/issues/828)
- [Falcor.keys](https://github.com/Netflix/falcor/issues/708)
  - Adds a function to the namespace of `falcor` for ease of json key iteration.
- [Remove Rx From Core](https://github.com/Netflix/falcor/issues/465)
  - [Remove Rx From Get](https://github.com/Netflix/falcor/issues/506)
  - [Remove Rx From Set](https://github.com/Netflix/falcor/issues/604)
- [Add Falcor Build that contains Router](https://github.com/Netflix/falcor/issues/521)
- [Code clean-up: Remove selector function / output PathValues code throughout code base](https://github.com/Netflix/falcor/issues/453)
- [Remove asPathValues from ModelResponse](https://github.com/Netflix/falcor/issues/452)
- [Improve deref for better MVC Integration](https://github.com/Netflix/falcor/issues/501)

## Bugs
- [Webpack](https://github.com/Netflix/falcor/issues/586)
- [MaxRetryExceededError when a route returns a null value not wrapped in an atom](https://github.com/Netflix/falcor/issues/535)
- [The latest release throws model.get(...).then is not a function error](https://github.com/Netflix/falcor/issues/530)
- [Collect does not adjust cache size.](https://github.com/Netflix/falcor/issues/507)
- [number 0 becomes empty atom](https://github.com/Netflix/falcor/issues/460)
- [\`this.clone()\` is undefined](https://github.com/Netflix/falcor/issues/442)
- [Model#call() -> Error: "no method 'reduce' on 'localRoot.set(...).reduce'"](https://github.com/Netflix/falcor/issues/533)
- [Observable and CompositeDisposable  declared but not used](https://github.com/Netflix/falcor/issues/573)
- [Path returned from falcor-router is undefined after call](https://github.com/Netflix/falcor/issues/589)
- [New deref doesn't work when deref'ing to a reference.](https://github.com/Netflix/falcor/issues/559)
- [New deref from an already deref'd model doesn't include the parent model's path.](https://github.com/Netflix/falcor/issues/560)

0.1.15
-------------------

## Bugs
- [Fix deref completing without onNext'ing if preload paths fail](https://github.com/Netflix/falcor/pull/667)
- [Fix deref handling for paths that return an $atom of undefined](https://github.com/Netflix/falcor/pull/663)
- [Make sure deref calls the DataSource, when starting from a broken reference](https://github.com/Netflix/falcor/pull/661)
- [Fix expired reference handling, to return undefined, instead of InvalidModelError](https://github.com/Netflix/falcor/pull/658)
- [Fixed expiry handling for getValueSync](https://github.com/Netflix/falcor/pull/651)
- [Fixed distinct comparator to account for meta-data ($expires for example)](https://github.com/Netflix/falcor/pull/644)
- [Fix getCache() serialization issues](https://github.com/Netflix/falcor/pull/640)
- [Fixed reference promotion in LRU list](https://github.com/Netflix/falcor/pull/636)
- [Fixed errorSelector bugs - cases where it wasn't invoked, and invoked with malformed paths](https://github.com/Netflix/falcor/pull/611)
- [Fixed exceptions when call responses didn't contain any returned path/values](https://github.com/Netflix/falcor/pull/600)

