const dijkstraService = require("./dijkstra.service");

function navigate(data) {

    const { source, destination } = data;

    const result = dijkstraService.findShortestPath(
        source,
        destination
    );

    return result;

}

module.exports = {
    navigate
};