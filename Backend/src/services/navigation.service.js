const dijkstraService = require("./dijkstra.service");
const nearestCheckpointService = require("./nearestCheckpoint.service");
const classroomService = require("./classroom.service");
const timetableService = require("./timetable.service");

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


function navigateToNextClass(data) {

    const {
        latitude,
        longitude,
        department,
        branch,
        semester,
        division,
        currentDate
    } = data;

    // Find current or next lecture
    const lectureResult = timetableService.getNextLecture(
        department,
        branch,
        Number(semester),
        division,
        currentDate ? new Date(currentDate) : new Date()
    );

    // No lecture available
    if (!lectureResult.lecture) {

        return {
            success: false,
            status: lectureResult.status,
            day: lectureResult.day,
            currentTime: lectureResult.currentTime,
            message: "No lecture available for navigation."
        };

    }

    // Reuse existing navigation logic
    const navigationResult = navigate({
        latitude,
        longitude,
        classroom: lectureResult.lecture.classroom
    });

    if (!navigationResult.success) {
        return navigationResult;
    }

    return {
        success: true,
        status: lectureResult.status,
        day: lectureResult.day,
        currentTime: lectureResult.currentTime,
        lecture: lectureResult.lecture,
        navigation: {
            path: navigationResult.path,
            distance: navigationResult.distance
        }
    };

}


module.exports = {
    navigate,
    navigateToNextClass
};