import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { getNextClass } from "../services/navigation";
import CampusMap from "../components/CampusMap";

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

    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState(null);
    const [userCoords, setUserCoords] = useState({
        latitude: null,
        longitude: null
    });
    const [navigationData, setNavigationData] = useState(null);

    const fetchNextClass = async (latitude, longitude) => {

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

            const response = await getNextClass(requestBody);

            setNavigationData(response);

        } catch (error) {

            if (error.response) {
                setErrorMessage(error.response.data.message || "Something went wrong.");
            } else {
                console.error(error);
                setErrorMessage("Something went wrong. Please check your connection.");
            }

        } finally {

            setIsLoading(false);

        }

    };

    const getUserLocation = () => {

        if (!navigator.geolocation) {
            setErrorMessage("Geolocation is not supported by your browser.");
            setIsLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(

            (position) => {

                const { latitude, longitude } = position.coords;

                setUserCoords({
                    latitude,
                    longitude
                });

                fetchNextClass(latitude, longitude);

            },

            (error) => {
                console.error(error);
                setErrorMessage("Unable to retrieve your location.");
                setIsLoading(false);
            }

        );

    };

    useEffect(() => {

        if (!department || !branch || !semester || !division) {
            navigate("/selection");
            return;
        }

        getUserLocation();

    }, []);

    return (
        <div>
            <h2>Navigation</h2>

            <CampusMap
                userLatitude={userCoords.latitude}
                userLongitude={userCoords.longitude}
            />

            {isLoading && <p>Finding your route...</p>}

            {errorMessage && (
                <p style={{ color: "red" }}>{errorMessage}</p>
            )}

            {
                navigationData?.success && (
                    <>
                        <NextLectureCard
                            lecture={navigationData.data.lecture}
                            status={navigationData.data.status}
                        />

                        <RouteDetails
                            navigation={navigationData.data.navigation}
                        />
                    </>
                )
            }
        </div>
    );

}

export default Navigation;