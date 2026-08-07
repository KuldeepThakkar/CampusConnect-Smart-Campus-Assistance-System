const dijkstraService = require("./dijkstra.service");
const nearestCheckpointService = require("./nearestCheckpoint.service");
const classroomService = require("./classroom.service");
const timetableService = require("./timetable.service");
const campusBoundaryService = require("./campusBoundary.service");
const routingService = require("./routing.service");
const campusData = require("./campus.service");

const GATE_CHECKPOINT_ID = "CP25";

async function navigate(data) {

    const { latitude, longitude, classroom } = data;

    const insideCampus = campusBoundaryService.isInsideCampus(latitude, longitude);

    const startCheckpointId = insideCampus
        ? nearestCheckpointService.findNearestCheckpoint(latitude, longitude).checkpointId
        : GATE_CHECKPOINT_ID;

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

    // If the user is outside campus, also fetch a real-world walking
    // route from their location to the gate
    let offCampusPath = null;

    if (!insideCampus) {

        const gateCheckpoint = campusData.checkpoints.find(
            (checkpoint) => checkpoint.id === GATE_CHECKPOINT_ID
        );

        try {

            offCampusPath = await routingService.getWalkingDirections(
                latitude,
                longitude,
                gateCheckpoint.latitude,
                gateCheckpoint.longitude
            );

        } catch (error) {

            console.error("OpenRouteService request failed:", error.message);
            offCampusPath = null;

        }

    }

    return {
        ...bestRoute,
        insideCampus,
        offCampusPath
    };

}


async function navigateToNextClass(data) {

    const {
        latitude,
        longitude,
        department,
        branch,
        semester,
        division,
        currentDate
    } = data;

    const lectureResult = timetableService.getNextLecture(
        department,
        branch,
        Number(semester),
        division,
        currentDate ? new Date(currentDate) : new Date()
    );

    if (!lectureResult.lecture) {

        return {
            success: false,
            status: lectureResult.status,
            day: lectureResult.day,
            currentTime: lectureResult.currentTime,
            message: "No lecture available for navigation."
        };

    }

    const navigationResult = await navigate({
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
            distance: navigationResult.distance,
            insideCampus: navigationResult.insideCampus,
            offCampusPath: navigationResult.offCampusPath
        }
    };

}


module.exports = {
    navigate,
    navigateToNextClass
};