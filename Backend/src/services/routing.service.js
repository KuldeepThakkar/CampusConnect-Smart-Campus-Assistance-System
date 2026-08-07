const ORS_API_KEY = process.env.ORS_API_KEY;
const ORS_BASE_URL = "https://api.openrouteservice.org/v2/directions/foot-walking";

async function getWalkingDirections(startLatitude, startLongitude, endLatitude, endLongitude) {

    const url = `${ORS_BASE_URL}?api_key=${ORS_API_KEY}&start=${startLongitude},${startLatitude}&end=${endLongitude},${endLatitude}`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`OpenRouteService request failed with status ${response.status}`);
    }

    const data = await response.json();

    const coordinates = data.features[0].geometry.coordinates;

    // ORS returns [longitude, latitude] pairs — flip to [latitude, longitude]
    // to match the convention every other part of this project already uses
    const path = coordinates.map(([longitude, latitude]) => [latitude, longitude]);

    return path;

}

module.exports = {
    getWalkingDirections
};