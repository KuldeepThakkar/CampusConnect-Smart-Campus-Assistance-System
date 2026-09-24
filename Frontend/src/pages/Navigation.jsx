import { useEffect, useState, useRef } from "react";

import { navigateToClassroom } from "../services/navigation";
import { getNextLecture, getTodayLectures } from "../services/timetable";
import { getCampusData } from "../services/campus";
import { useAuth } from "../context/AuthContext";

import NextLectureCard from "../components/NextLectureCard";
import RouteDetails from "../components/RouteDetails";
import CampusMap from "../components/CampusMap";
import LecturePicker from "../components/LecturePicker";

function Navigation() {

    const { user } = useAuth();

    const {
        department,
        branch,
        semester,
        division
    } = user.academicDetails;

    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState(null);
    const [userCoords, setUserCoords] = useState({
        latitude: null,
        longitude: null
    });

    const [lectures, setLectures] = useState([]);
    const [selectedLecture, setSelectedLecture] = useState(null);
    const [autoLecture, setAutoLecture] = useState(null);
    const [autoStatus, setAutoStatus] = useState(null);

    const [navigationData, setNavigationData] = useState(null);
    const [checkpoints, setCheckpoints] = useState({});

    const watchIdRef = useRef(null);
    const lastFetchedCoordsRef = useRef(null);
    const isFetchingRef = useRef(false);
    const hasFetchedOnceRef = useRef(false);
    const selectedLectureRef = useRef(null);

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

    // Response from POST /navigation/ is flat: {path, distance, insideCampus, offCampusPath}
    const routeCoordinates = (navigationData?.data?.path || [])
        .map((checkpointId) => checkpoints[checkpointId])
        .filter(Boolean);

    const offCampusPath = navigationData?.data?.offCampusPath || [];

    const fetchRoute = async (latitude, longitude, classroom, isBackgroundUpdate = false) => {

        isFetchingRef.current = true;

        try {

            const response = await navigateToClassroom({ latitude, longitude, classroom });

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

    const loadLectureData = async () => {

        try {

            const requestBody = {
                department,
                branch,
                semester: Number(semester),
                division
            };

            const [nextLectureResponse, todayLecturesResponse] = await Promise.all([
                getNextLecture(requestBody),
                getTodayLectures(requestBody)
            ]);

            const { status, lecture } = nextLectureResponse.data;

            setAutoStatus(status);
            setAutoLecture(lecture);
            setLectures(todayLecturesResponse.data.lectures);

            if (lecture) {
                setSelectedLecture(lecture);
            } else {
                // No auto-detected lecture (break/no-lecture/none left today) —
                // nothing to route to until the student picks one manually.
                setIsLoading(false);
            }

        } catch (error) {

            console.error(error);
            setErrorMessage("Couldn't load today's timetable.");
            setIsLoading(false);

        }

    };

    const getUserLocation = () => {

        if (!navigator.geolocation) {
            setErrorMessage("Geolocation is not supported by your browser.");
            setIsLoading(false);
            return;
        }

        watchIdRef.current = navigator.geolocation.watchPosition(

            (position) => {

                const { latitude, longitude } = position.coords;

                setUserCoords({ latitude, longitude });

                const currentLecture = selectedLectureRef.current;

                if (!currentLecture) {
                    return;
                }

                const lastCoords = lastFetchedCoordsRef.current;

                const hasMovedEnough = !lastCoords || getDistanceInMeters(
                    lastCoords.latitude, lastCoords.longitude, latitude, longitude
                ) >= MOVEMENT_THRESHOLD_METERS;

                if (hasMovedEnough && !isFetchingRef.current) {

                    lastFetchedCoordsRef.current = { latitude, longitude };

                    fetchRoute(latitude, longitude, currentLecture.classroom, hasFetchedOnceRef.current);

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

    useEffect(() => {
        selectedLectureRef.current = selectedLecture;
    }, [selectedLecture]);

    // Whenever the selected lecture changes (initial auto-pick, or a manual
    // pick from the picker), fetch a fresh route immediately using the last
    // known coordinates — don't wait for the next GPS movement tick.
    useEffect(() => {

        if (!selectedLecture) {
            setNavigationData(null);
            return;
        }

        if (userCoords.latitude != null && userCoords.longitude != null) {

            lastFetchedCoordsRef.current = { latitude: userCoords.latitude, longitude: userCoords.longitude };

            fetchRoute(userCoords.latitude, userCoords.longitude, selectedLecture.classroom, hasFetchedOnceRef.current);

            hasFetchedOnceRef.current = true;

        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedLecture]);

    useEffect(() => {
        loadLectureData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
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

    const isAutoSelected = selectedLecture && autoLecture
        && selectedLecture.startTime === autoLecture.startTime
        && selectedLecture.classroom === autoLecture.classroom;

    const displayStatus = isAutoSelected ? autoStatus : "SELECTED";

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

            <div className="results">

                <LecturePicker
                    lectures={lectures}
                    selectedLecture={selectedLecture}
                    onSelect={setSelectedLecture}
                />

                {selectedLecture && (
                    <NextLectureCard
                        lecture={selectedLecture}
                        status={displayStatus}
                    />
                )}

                {navigationData?.success && selectedLecture && (
                    <RouteDetails
                        navigation={navigationData.data}
                    />
                )}

            </div>

        </div>
    );

}

export default Navigation;