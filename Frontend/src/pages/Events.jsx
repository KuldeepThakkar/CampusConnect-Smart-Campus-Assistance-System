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
            <Link to="/" className="btn-retry" style={{ display: "inline-block", marginBottom: "16px", textDecoration: "none" }}>
                ← Home
            </Link>
            <h2>Events</h2>

            {canCreateEvent && (
                <Link to="/create-event" style={{ display: "block", marginBottom: "16px", textDecoration: "none" }}>
                    <button type="button" className="btn-primary">Create Event</button>
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