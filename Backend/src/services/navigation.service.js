const dijkstraService = require("./dijkstra.service");
const nearestCheckpointService = require("./nearestCheckpoint.service");
const classroomService = require("./classroom.service");
const timetableService = require("./timetable.service");
const campusBoundaryService = require("./campusBoundary.service");

function navigate(data) {

    const { latitude, longitude, classroom } = data;

    const insideCampus = campusBoundaryService.isInsideCampus(latitude, longitude);

    const startCheckpointId = insideCampus
        ? nearestCheckpointService.findNearestCheckpoint(latitude, longitude).checkpointId
        : "CP25";

    const building = classroomService.findBuildingByClassroom(classroom);

    if (!building) {

        return {
            success: false,
            message: "Classroom not found"
        };

    }

    let bestRoute = null;

    building.entrances.forEach((entrance) => {

        const route = dijkstraService.findShortestPath(startCheckpointId, entrance);

        if (!route.success) return;

        if (bestRoute === null || route.distance < bestRoute.distance) {
            bestRoute = route;
        }

    });

    if (!bestRoute) {

        return {
            success: false,
            message: "No route found"
        };

    }

    return {
        ...bestRoute,
        insideCampus
    };

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