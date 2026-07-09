const dijkstraService = require("./dijkstra.service");
const nearestCheckpointService = require("./nearestCheckpoint.service");
const classroomService = require("./classroom.service");

function navigate(data) {

    const { latitude, longitude, classroom } = data;

    // Find nearest checkpoint to the user
    const nearestCheckpoint = nearestCheckpointService.findNearestCheckpoint(
        latitude,
        longitude
    );

    // Find the building containing the classroom
    const building = classroomService.findBuildingByClassroom(classroom);

    if (!building) {

        return {

            success: false,

            message: "Classroom not found"

        };

    }

    // Variable to store the best route
    let bestRoute = null;

    // Check every entrance of the building
    building.entrances.forEach((entrance) => {

        const route = dijkstraService.findShortestPath(

            nearestCheckpoint.checkpointId,

            entrance

        );

        // Ignore invalid routes
        if (!route.success)
            return;

        // First route
        if (bestRoute === null) {

            bestRoute = route;

            return;

        }

        // Replace if current route is shorter
        if (route.distance < bestRoute.distance) {

            bestRoute = route;

        }

    });

    if (!bestRoute) {

        return {

            success: false,

            message: "No route found"

        };

    }

    return bestRoute;

}

module.exports = {
    navigate
};