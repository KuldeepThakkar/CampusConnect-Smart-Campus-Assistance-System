import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, CircleMarker, Polyline, useMap } from "react-leaflet";
import L from "leaflet";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow
});

// TODO: replace with your campus's actual center coordinates
const CAMPUS_CENTER = [23.0225, 72.5714];

    function MapUpdater({ userLatitude, userLongitude, routePath }) {

        const map = useMap();

        useEffect(() => {

            if (routePath && routePath.length > 0) {

                const bounds = userLatitude && userLongitude
                    ? [...routePath, [userLatitude, userLongitude]]
                    : routePath;

                map.fitBounds(bounds, { padding: [40, 40] });

            } else if (userLatitude && userLongitude) {

                map.setView([userLatitude, userLongitude], map.getZoom());

            }

        }, [userLatitude, userLongitude, routePath]);

        return null;

    }

    function CampusMap({ userLatitude, userLongitude, routePath, isLoading }) {

        const destination = routePath && routePath.length > 0
            ? routePath[routePath.length - 1]
            : null;

        return (
            <div
                style={{
                    position: "relative",
                    borderRadius: "12px",
                    overflow: "hidden",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)"
                }}
            >
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
                        <Marker position={[userLatitude, userLongitude]} />
                    )}

                    {routePath && routePath.length > 0 && (
                        <Polyline positions={routePath} pathOptions={{ color: "blue", weight: 4 }} />
                    )}

                    {destination && (
                        <CircleMarker
                            center={destination}
                            radius={8}
                            pathOptions={{ color: "red", fillColor: "red", fillOpacity: 1 }}
                        />
                    )}

                    <MapUpdater
                        userLatitude={userLatitude}
                        userLongitude={userLongitude}
                        routePath={routePath}
                    />

                </MapContainer>

                {isLoading && (
                    <div
                        style={{
                            position: "absolute",
                            top: 12,
                            left: 12,
                            padding: "6px 12px",
                            backgroundColor: "rgba(0, 0, 0, 0.7)",
                            color: "white",
                            borderRadius: "6px",
                            fontSize: "14px",
                            zIndex: 1000
                        }}
                    >
                        Locating you...
                    </div>
                )}

            </div>
        );

    }

export default CampusMap;