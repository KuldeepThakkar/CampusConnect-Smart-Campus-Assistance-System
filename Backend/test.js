// test-routing.js
require("dotenv").config();

const routingService = require("./src/services/routing.service");

async function run() {

    // Pick a real-world point outside your campus, and CP25's coordinates
    const path = await routingService.getWalkingDirections(
        23.05, 72.40,           // some point outside campus
        23.064504359995777, 72.43899285793306  // CP25 (the gate)
    );

    console.log(path);

}

run();