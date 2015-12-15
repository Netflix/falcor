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
