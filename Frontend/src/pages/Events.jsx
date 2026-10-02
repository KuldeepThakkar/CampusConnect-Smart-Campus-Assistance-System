import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getAllEvents } from "../services/event";
import { useAuth } from "../context/AuthContext";
import EventCard from "../components/EventCard";

function Events() {

    const { user } = useAuth();

    const [events, setEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState(null);

    const loadEvents = async () => {

        setIsLoading(true);
        setErrorMessage(null);

        try {

            const response = await getAllEvents();
            setEvents(response.data.events);

        } catch (error) {

            if (error.response) {
                setErrorMessage(error.response.data.message || "Couldn't load events.");
            } else {
                setErrorMessage("Something went wrong. Please check your connection.");
            }

        } finally {
            setIsLoading(false);
        }

    };

    useEffect(() => {
        loadEvents();
    }, []);

    const canCreateEvent = user?.role === "teacher" || user?.role === "admin";

    return (
        <div>
            <h2>Events</h2>

            {canCreateEvent && (
                <Link to="/create-event" className="btn-primary" style={{ display: "inline-block", textAlign: "center", textDecoration: "none", marginBottom: "16px" }}>
                    Create Event
                </Link>
            )}

            {isLoading && <p className="status-text">Loading events...</p>}

            {errorMessage && (
                <div className="error-box">
                    <p>{errorMessage}</p>
                </div>
            )}

            {!isLoading && !errorMessage && events.length === 0 && (
                <p className="status-text">No events scheduled.</p>
            )}

            {events.length > 0 && (
                <div className="results">
                    {events.map((event) => (
                        <EventCard key={event._id} event={event} />
                    ))}
                </div>
            )}

        </div>
    );

}

export default Events;