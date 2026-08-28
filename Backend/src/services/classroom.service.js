const campusData = require("./campus.service");

function findBuildingByClassroom(classroom) {

    return campusData.buildings.find((building) => {
        return building.classrooms.includes(classroom);
    });

}

function getAllClassrooms() {

    const rooms = new Set();

    campusData.buildings.forEach((building) => {
        (building.classrooms || []).forEach((room) => {
            rooms.add(room);
        });
    });

    return Array.from(rooms).sort();

}

module.exports = {
    findBuildingByClassroom,
    getAllClassrooms
};