/* eslint-disable */
var falcor = require('..');

var datasource = require('../../nq-router-schema/datasource')();
var model = falcor({
  schema: datasource.discover(),
  source: datasource
});

module.exports = model;

// console.log(model.data);
// console.log(model.data.profilesByGuid('afk'));
// console.log(model.data.profilesByGuid('afk').lolomoByMap('lolomap'));

// console.log(model.data.profilesByGuid('afk').lolomoByMap('lolomap').items({ from: 0, to: 10 }).list.items(0).video.summary);
// var videoSummaryRequest = model.data.profilesByGuid('afk').lolomoByMap('lolomap').items(0).list.items(0).video.summary;
// var videoTitleRequest = model.data.profilesByGuid('7JHDXW5LZNAMVJBNRTVRH4CREM').videosById('80002537').title;
// console.log(videoTitleRequest);

(async function() {
  var videoTitleRequest = model.data.videos('80002537').summary;
  console.log(await videoTitleRequest);
}());

// datasource.mockDNA.
//   get([
//     ["profilesByGuid", "7JHDXW5LZNAMVJBNRTVRH4CREM", "videosById", "80002537", "title"]
//   ]).
//   subscribe(function (data) {
//     console.log(JSON.stringify(data, null, 2));
//   });
