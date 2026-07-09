const dijkstraService = require("./dijkstra.service");
const nearestCheckpointService = require("./nearestCheckpoint.service");

function navigate(data) {

    const { latitude, longitude, destination } = data;

    const nearestCheckpoint =
        nearestCheckpointService.findNearestCheckpoint(
            latitude,
            longitude
        );

    const result = dijkstraService.findShortestPath(
        nearestCheckpoint.checkpointId,
        destination
    );

    return result;

}

module.exports = {
    navigate
};