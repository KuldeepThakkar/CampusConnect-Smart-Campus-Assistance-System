const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "../data/campus-boundary.json");

const boundaryData = JSON.parse(
    fs.readFileSync(filePath, "utf-8")
);

function isInsideCampus(latitude, longitude) {

    const polygon = boundaryData.buildings[0].polygon;

    let inside = false;

    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {

        const [latI, lngI] = polygon[i];
        const [latJ, lngJ] = polygon[j];

        const intersects = ((lngI > longitude) !== (lngJ > longitude)) &&
            (latitude < ((latJ - latI) * (longitude - lngI)) / (lngJ - lngI) + latI);

        if (intersects) {
            inside = !inside;
        }

    }

    return inside;

}

module.exports = {
    isInsideCampus
};