import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { getNextClass } from "../services/navigation";
import CampusMap from "../components/CampusMap";
import { getCampusData } from "../services/campus";

import NextLectureCard from "../components/NextLectureCard";
import RouteDetails from "../components/RouteDetails";

function Navigation(){

    const location = useLocation();
    const navigate = useNavigate();

    const {
        department,
        branch,
        semester,
        division
    } = location.state || {};

    

    const [checkpoints, setCheckpoints] = useState({});

    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState(null);
    const [userCoords, setUserCoords] = useState({
        latitude: null,
        longitude: null
    });
    const [navigationData, setNavigationData] = useState(null);

    const routeCoordinates = (navigationData?.data?.navigation?.path || [])
        .map((checkpointId) => checkpoints[checkpointId])
        .filter(Boolean);

    const offCampusPath = navigationData?.data?.navigation?.offCampusPath || [];

const fetchNextClass = async (latitude, longitude, isBackgroundUpdate = false) => {

    isFetchingRef.current = true;

    try {

        const requestBody = {
            latitude,
            longitude,
            department,
            branch,
            semester: Number(semester),
            division,
            currentDate: "2026-07-31T14:03:23"
            // currentDate: new Date().toISOString().slice(0, 19)
        };

            // requestBody.latitude = 23.06502989563914;
            // requestBody.longitude = 72.4400979280472;

        const response = await getNextClass(requestBody);

        setNavigationData(response);
        setErrorMessage(null);

    } catch (error) {

        if (isBackgroundUpdate) {

            console.error("Background route refresh failed:", error);

        } else if (error.response) {
            setErrorMessage(error.response.data.message || "Something went wrong.");
        } else {
            console.error(error);
            setErrorMessage("Something went wrong. Please check your connection.");
        }

    } finally {

        setIsLoading(false);
        isFetchingRef.current = false;

    }

};
    // const fetchNextClass = async (latitude, longitude) => {

    //     try {

    //         const requestBody = {
    //             latitude ,
    //             longitude ,
    //             department,
    //             branch,
    //             semester: Number(semester),
    //             division,
    //             currentDate: "2026-07-31T14:03:23"
    //             // currentDate: new Date().toISOString().slice(0, 19)
    //         };
    //         // "latitude": 23.06502989563914,
    //         // "longitude": 72.4400979280472
    //         // requestBody.latitude = 23.06502989563914;
    //         // requestBody.longitude = 72.4400979280472;

    //         const response = await getNextClass(requestBody);

    //         setNavigationData(response);

    //     } catch (error) {

    //         if (error.response) {
    //             setErrorMessage(error.response.data.message || "Something went wrong.");
    //         } else {
    //             console.error(error);
    //             setErrorMessage("Something went wrong. Please check your connection.");
    //         }

    //     } finally {

    //         setIsLoading(false);

    //     }

    // };

    const watchIdRef = useRef(null);

    const getUserLocation = () => {

        if (!navigator.geolocation) {
            setErrorMessage("Geolocation is not supported by your browser.");
            setIsLoading(false);
            return;
        }

        watchIdRef.current = navigator.geolocation.watchPosition(

            (position) => {

                const { latitude, longitude } = position.coords;

                setUserCoords({
                    latitude,
                    longitude
                });

                const lastCoords = lastFetchedCoordsRef.current;

                const hasMovedEnough = !lastCoords || getDistanceInMeters(
                    lastCoords.latitude, lastCoords.longitude, latitude, longitude
                ) >= MOVEMENT_THRESHOLD_METERS;

                if (hasMovedEnough && !isFetchingRef.current) {

                    lastFetchedCoordsRef.current = { latitude, longitude };

                    fetchNextClass(latitude, longitude, hasFetchedOnceRef.current);

                    hasFetchedOnceRef.current = true;

                }

            },

            (error) => {
                console.error(error);
                setErrorMessage("Unable to retrieve your location.");
                setIsLoading(false);
            },

            {
                enableHighAccuracy: true,
                maximumAge: 5000
            }

        );

    };

    const fetchCheckpoints = async () => {

        try {

            const response = await getCampusData();

            const lookup = {};

            response.data.checkpoints.forEach((checkpoint) => {
                lookup[checkpoint.id] = [checkpoint.latitude, checkpoint.longitude];
            });

            setCheckpoints(lookup);
           

        } catch (error) {
            console.error(error);
        }

    };

    const lastFetchedCoordsRef = useRef(null);
    const isFetchingRef = useRef(false);
    const hasFetchedOnceRef = useRef(false);

    const MOVEMENT_THRESHOLD_METERS = 25;

    function getDistanceInMeters(lat1, lon1, lat2, lon2) {

        const R = 6371000;
        const toRad = (deg) => (deg * Math.PI) / 180;

        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);

        const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;

    }

    useEffect(() => {

        if (!department || !branch || !semester || !division) {
            navigate("/selection");
            return;
        }

        getUserLocation();

    }, []);

    useEffect(() => {
        fetchCheckpoints();
    }, []);

    useEffect(() => {

        return () => {

            if (watchIdRef.current !== null) {
                navigator.geolocation.clearWatch(watchIdRef.current);
            }

        };

    }, []);
    
    return (
        <div>
            <h2>Navigation</h2>

            <div className="map-wrapper">
                <CampusMap
                    userLatitude={userCoords.latitude}
                    userLongitude={userCoords.longitude}
                    routePath={routeCoordinates}
                    offCampusPath={offCampusPath}
                    isLoading={isLoading}
                />
            </div>

            {isLoading && <p className="status-text">Finding your route...</p>}

            {errorMessage && (
                <div className="error-box">
                    <p>{errorMessage}</p>
                </div>
            )}

            {
                navigationData?.success && (
                    <div className="results">
                        <NextLectureCard
                            lecture={navigationData.data.lecture}
                            status={navigationData.data.status}
                        />

                        <RouteDetails
                            navigation={navigationData.data.navigation}
                        />
                    </div>
                )
            }
        </div>
    );

}

export default Navigation;