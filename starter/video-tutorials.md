---
layout: plain-page
title: Video Tutorials
id: video_tutorials
lang: en
---


## Learn Falcor: Video Tutorials

### 1. [Introduction to the Model](https://www.youtube.com/watch?v=xby_MUlBOw0)

In this video will learn how to work with JSON data indirectly through a Falcor Model. The Falcor Model allows you to work with data using the same familiar JavaScript path syntax. However the Model uses a push API, sending the data to a callback rather than returning it immediately. Using a push API means that you can move your data anywhere in the network later on, without changing the data retrieval code in your client.

### 2. [Retrieving Multiple Values](http://youtu.be/6c0BEPywkYc)

In addition to being able to retrieve a path from a Falcor Model, you can also retrieve multiple Path Sets. Path Sets are paths that contain ranges or multiple string keys inside of indexers. In addition to being able to retrieve a Path Set, you can also retrieve as many paths as you like in a single method call.

### 3. [Intro to JSON Graph](https://www.youtube.com/watch?v=2xX5JTHWw4Q)

JSON is a very commonly used data interchange format. Unfortunately while most application domain models are graphs, JSON is designed to model hierarchical information. To get around this problem, Falcor introduces JSON Graph. JSON Graph introduces references to JSON, allowing you to ensure that no object appears more than once in your JSON.

### 4. [Building Paths Programmatically](https://www.youtube.com/watch?v=XyMHk4wKg3Q)

In this video you will learn how to build Paths and Path Sets programmatically using Arrays.

### 5. [JSON Graph in-depth](https://www.youtube.com/watch?v=9tAvnn-Wd14)

In this video you will learn why it is only possible to retrieve value types from a Falcor Model. The prohibition against retrieving Objects or Arrays from your JSON object leads to more predicable server performance, because server requests stay approximately the same speed despite the growth of your backend data set.

### 6. [Retrieving Data from the Server](http://youtu.be/dlcqUcjR1Ig)

In this video you will learn how to retrieve data from an Node application server running express. You'll also learn about the DataSource interface, and how Models use DataSources to retrieve JSON data.

### 7. [Path Optimization](https://www.youtube.com/watch?v=PlG55w_G9mw)

One of the most powerful optimizations Falcor makes when requesting data from the server is Path Optimization. When patterns are requested from the model, the model checks it's local cache first, and if the value is not present, requests the data from its data source (usually the server). However if references are encountered while evaluating the path against the cache, the Model uses them to optimize the path before forwarding the path request to the data source. By providing optimized paths to the server Falcor can reduce the cost of retrieving data from your persistent data stores.

### 8. [Batching Requests](https://www.youtube.com/watch?v=ulK8m8_HGJg)

In addition to caching and path optimization, the Falcor Model provides one more optimization when requesting data from the server: batching. By creating a batched Falcor Model you can collapse multiple concurrent path requests into a single HTTP request.
