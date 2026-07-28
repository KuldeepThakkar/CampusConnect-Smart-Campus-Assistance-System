const campusData = require("./campus.service");

function calculateDistance(lat1, lon1, lat2, lon2) {

    const earthRadius = 6371000;

    const latitudeDifference = (lat2 - lat1) * (Math.PI / 180);
    const longitudeDifference = (lon2 - lon1) * (Math.PI / 180);

    const a =
        Math.sin(latitudeDifference / 2) * Math.sin(latitudeDifference / 2) +
        Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *
        Math.sin(longitudeDifference / 2) *
        Math.sin(longitudeDifference / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return earthRadius * c;

}

function findNearestCheckpoint(latitude, longitude) {

    let nearestCheckpoint = null;

    let minimumDistance = Infinity;

    campusData.checkpoints.forEach((checkpoint) => {

        const distance = calculateDistance(
            latitude,
            longitude,
            checkpoint.latitude,
            checkpoint.longitude
        );

        if (distance < minimumDistance) {

            minimumDistance = distance;
            nearestCheckpoint = checkpoint;

        }

    });

    return {
        checkpointId: nearestCheckpoint.id,
        distance: minimumDistance
    };

}

module.exports = {
    findNearestCheckpoint
};