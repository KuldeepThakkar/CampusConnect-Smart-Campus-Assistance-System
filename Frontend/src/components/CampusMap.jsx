import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Fix Leaflet's default marker icon, which breaks under Vite/Webpack bundling
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow
});

// TODO: replace with your campus's actual center coordinates
const CAMPUS_CENTER = [23.0225, 72.5714];

function RecenterMap({ latitude, longitude }) {

    const map = useMap();

    useEffect(() => {

        if (latitude && longitude) {
            map.setView([latitude, longitude], map.getZoom());
        }

    }, [latitude, longitude]);

    return null;

}

function CampusMap({ userLatitude, userLongitude }) {
    console.log(userLatitude,userLongitude);
    

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

            {userLatitude && userLongitude && (
                <>
                    <Marker position={[userLatitude, userLongitude]} />
                    <RecenterMap latitude={userLatitude} longitude={userLongitude} />
                </>
            )}
        </MapContainer>
    );

}

export default CampusMap;