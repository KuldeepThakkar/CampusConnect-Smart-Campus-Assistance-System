import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import { createEvent } from "../services/event";

function CreateEvent() {

    const navigate = useNavigate();

    const [eventName, setEventName] = useState("");
    const [eventDate, setEventDate] = useState("");
    const [eventTime, setEventTime] = useState("");
    const [location, setLocation] = useState("");
    const [description, setDescription] = useState("");
    const [coordinator, setCoordinator] = useState("");

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);

    const handleSubmit = async (e) => {

        e.preventDefault();

        setIsSubmitting(true);
        setErrorMessage(null);

        try {

            await createEvent({
                eventName,
                eventDate,
                eventTime,
                location,
                description,
                coordinator
            });

            navigate("/events");

        } catch (error) {

            if (error.response) {
                setErrorMessage(error.response.data.message || "Couldn't create event.");
            } else {
                setErrorMessage("Something went wrong. Please check your connection.");
            }

        } finally {
            setIsSubmitting(false);
        }

    };

    return (
        <div>
            <Link to="/events" className="btn-retry" style={{ display: "inline-block", marginBottom: "16px", textDecoration: "none" }}>
                ← Back to Events
            </Link>

            <h2>Create Event</h2>

            <form onSubmit={handleSubmit}>

                <div className="field">
                    <label htmlFor="eventName">Event Name</label>
                    <input
                        id="eventName"
                        type="text"
                        value={eventName}
                        onChange={(e) => setEventName(e.target.value)}
                        disabled={isSubmitting}
                        required
                    />
                </div>

                <div className="field">
                    <label htmlFor="eventDate">Date</label>
                    <input
                        id="eventDate"
                        type="date"
                        value={eventDate}
                        onChange={(e) => setEventDate(e.target.value)}
                        min={new Date().toLocaleDateString("en-CA")}
                        disabled={isSubmitting}
                        required
                    />
                </div>

                <div className="field">
                    <label htmlFor="eventTime">Time</label>
                    <input
                        id="eventTime"
                        type="time"
                        value={eventTime}
                        onChange={(e) => setEventTime(e.target.value)}
                        disabled={isSubmitting}
                        required
                    />
                </div>

                <div className="field">
                    <label htmlFor="location">Location</label>
                    <input
                        id="location"
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        disabled={isSubmitting}
                        required
                    />
                </div>

                <div className="field">
                    <label htmlFor="coordinator">Coordinator</label>
                    <input
                        id="coordinator"
                        type="text"
                        value={coordinator}
                        onChange={(e) => setCoordinator(e.target.value)}
                        disabled={isSubmitting}
                        required
                    />
                </div>

                <div className="field">
                    <label htmlFor="description">Description</label>
                    <input
                        id="description"
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        disabled={isSubmitting}
                        
                    />
                </div>

                {errorMessage && (
                    <div className="error-box">
                        <p>{errorMessage}</p>
                    </div>
                )}

                <button type="submit" className="btn-primary" disabled={isSubmitting}>
                    {isSubmitting ? "Creating..." : "Create Event"}
                </button>

            </form>

        </div>
    );

}

export default CreateEvent;