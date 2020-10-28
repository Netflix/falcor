---
layout: video-page
title: Path Optimization
id: path_optimization
youtube_id: "PlG55w_G9mw"
---

## Path Optimization

One of the most powerful optimizations Falcor makes when requesting data from the server is Path Optimization. When patterns are requested from the model, the model checks it's local cache first, and if the value is not present, requests the data from its data source (usually the server). However if references are encountered while evaluating the path against the cache, the Model uses them to optimize the path before forwarding the path request to the data source. By providing optimized paths to the server Falcor can reduce the cost of retrieving data from your persistent data stores.