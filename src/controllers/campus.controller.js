const campusData = require("../services/campus.service");
const graph = require("../services/graph.service");

function getCampus(req, res){

    res.status(200).json({
        success: true,
        data: campusData
    });

}

function getGraph(req, res){

    res.status(200).json(graph);

}

module.exports = {
    getCampus,
    getGraph
};