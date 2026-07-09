const graph = require("./graph.service");

function findShortestPath(source, destination) {

    if (!graph[source]) {
        return {
            success: false,
            message: "Invalid Source Checkpoint"
        };
    }

    if (!graph[destination]) {
        return {
            success: false,
            message: "Invalid Destination Checkpoint"
        };
    }

    const distances = {};
    const previous = {};
    const visited = new Set();

    Object.keys(graph).forEach((node) => {

        distances[node] = Infinity;
        previous[node] = null;

    });

    distances[source] = 0;

    while (true) {

    let currentNode = null;
    let minimumDistance = Infinity;

    Object.keys(graph).forEach((node) => {

        if (
            !visited.has(node) &&
            distances[node] < minimumDistance
        ) {
            minimumDistance = distances[node];
            currentNode = node;
        }

    });

    if (currentNode === null) {
        break;
    }

    if (currentNode === destination) {
        break;
    }

    visited.add(currentNode);

    graph[currentNode].forEach((neighbor) => {

    if (visited.has(neighbor.node)) {
        return;
    }

    const newDistance =
        distances[currentNode] + neighbor.distance;

    if (newDistance < distances[neighbor.node]) {

        distances[neighbor.node] = newDistance;

        previous[neighbor.node] = currentNode;

    }

});

}
const path = [];

let currentNode = destination;

while (currentNode !== null) {

    path.unshift(currentNode);

    currentNode = previous[currentNode];

}
return {

    success: true,

    path,

    distance: distances[destination]

};

}

module.exports = {
    findShortestPath
};