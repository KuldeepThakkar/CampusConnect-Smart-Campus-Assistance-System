const ORS_API_KEY = process.env.ORS_API_KEY;
const ORS_BASE_URL = "https://api.openrouteservice.org/v2/directions";

async function getDirections(profile, startLatitude, startLongitude, endLatitude, endLongitude) {

    const url = `${ORS_BASE_URL}/${profile}?api_key=${ORS_API_KEY}&start=${startLongitude},${startLatitude}&end=${endLongitude},${endLatitude}`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`OpenRouteService request failed with status ${response.status}`);
    }

    const data = await response.json();

    const coordinates = data.features[0].geometry.coordinates;

    const path = coordinates.map(([longitude, latitude]) => [latitude, longitude]);

    return path;

}

module.exports = {
    getDirections
};