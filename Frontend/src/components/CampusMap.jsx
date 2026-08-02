import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet";
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

function CampusMap({ userLatitude, userLongitude, routePath }) {

    return (
        <MapContainer
            center={CAMPUS_CENTER}
            zoom={18}
            style={{ height: "400px", width: "100%" }}
        >
            <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                attribution='Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community'
            />

            {userLatitude && userLongitude && (
                <>
                    <Marker position={[userLatitude, userLongitude]} />
                    <RecenterMap latitude={userLatitude} longitude={userLongitude} />
                </>
            )}

            {routePath && routePath.length > 0 && (
                <Polyline positions={routePath} pathOptions={{ color: "blue", weight: 4 }} />
            )}
        </MapContainer>
    );

}

export default CampusMap;