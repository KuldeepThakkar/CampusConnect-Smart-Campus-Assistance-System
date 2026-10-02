import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getAllEvents, deleteEvent } from "../services/event";
import { useAuth } from "../context/AuthContext";
import EventCard from "../components/EventCard";

function Events() {

    const { user } = useAuth();

    const [events, setEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState(null);

    const [deletingId, setDeletingId] = useState(null);
    const [deleteError, setDeleteError] = useState(null);

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

    const handleDelete = async (eventId) => {

        setDeleteError(null);
        setDeletingId(eventId);

        try {

            await deleteEvent(eventId);
            await loadEvents();

        } catch (error) {

            if (error.response) {
                setDeleteError(error.response.data.message || "Couldn't delete this event.");
            } else {
                setDeleteError("Something went wrong. Please check your connection.");
            }

        } finally {
            setDeletingId(null);
        }

    };

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

            {deleteError && (
                <div className="error-box">
                    <p>{deleteError}</p>
                </div>
            )}

            {!isLoading && !errorMessage && events.length === 0 && (
                <p className="status-text">No events scheduled.</p>
            )}

            {events.length > 0 && (
                <div className="results">
                    {events.map((event) => (
                        <EventCard
                            key={event._id}
                            event={event}
                            currentUser={user}
                            onDelete={handleDelete}
                            isDeleting={deletingId === event._id}
                        />
                    ))}
                </div>
            )}

        </div>
    );

}

export default Events;