0.1.17
-------------------

- [Removed boxed values for asDataSource() because its incorrect behavior](https://github.com/Netflix/falcor/pull/747)
- [Fix for the materialized undefined issue.  If the cache contains values but the requests yields only empty values, then the overall operation will simply complete](https://github.com/Netflix/falcor/pull/715)
- [Fixed potential for the deref get to wipe out cache](https://github.com/Netflix/falcor/pull/702)
- [Fixed deref not working when the extra paths are atoms of undefined](https://github.com/Netflix/falcor/pull/674)
- [Fix getCache to strip ALL internal keys](https://github.com/Netflix/falcor/pull/671)

0.1.16 (do not use)
-------------------

- We inadvertently published this release from master, instead of the 0.x branch, resulting in backwards incompatible changes (see CHANGELOG.md and MIGRATION.md on master).

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
