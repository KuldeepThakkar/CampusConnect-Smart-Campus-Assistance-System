const campusData = require("./campus.service");

function findBuildingByClassroom(classroom) {

    return campusData.buildings.find((building) => {

        return building.classrooms.includes(classroom);

    });

}

module.exports = {
    findBuildingByClassroom
};