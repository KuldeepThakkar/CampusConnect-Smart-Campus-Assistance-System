import { MapContainer, TileLayer } from "react-leaflet";

// TODO: replace with your campus's actual center coordinates
const CAMPUS_CENTER = [23.0302, 72.5772];

function CampusMap() {

    return (
        <MapContainer
            center={CAMPUS_CENTER}
            zoom={18}
            style={{ height: "400px", width: "100%" }}
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
        </MapContainer>
    );

}

export default CampusMap;