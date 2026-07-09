const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "../data/campus-data.json");

const campusData = JSON.parse(
    fs.readFileSync(filePath, "utf-8")
);

module.exports = campusData;