const campusData = require("./campus.service");

const graph = {};

campusData.checkpoints.forEach((checkpoint) => {

    graph[checkpoint.id] = [];

});

campusData.paths.forEach((path) => {

    graph[path.from].push({

        node: path.to,

        distance: path.distance

    });

    graph[path.to].push({

        node: path.from,

        distance: path.distance

    });

});
module.exports = graph;