function EventCard({ event, currentUser, onDelete, isDeleting }) {

    const canDelete = currentUser && (
        currentUser.role === "admin" ||
        (currentUser.role === "teacher" && event.createdBy === currentUser.id)
    );

    const todayDateStr = new Date().toLocaleDateString("en-CA");
    const isPast = event.eventDate < todayDateStr;

    return (
        <div className="card">

            <div className="card-header">
                <h2>{event.eventName}</h2>
                <span className={`badge ${isPast ? "badge-upcoming" : "badge-on-campus"}`}>
                    {isPast ? "Past" : "Upcoming"}
                </span>
            </div>

            <div className="card-row">
                <span className="card-row-label">Date</span>
                <span className="card-row-value mono">{event.eventDate}</span>
            </div>

            <div className="card-row">
                <span className="card-row-label">Time</span>
                <span className="card-row-value mono">{event.eventTime}</span>
            </div>

            <div className="card-row">
                <span className="card-row-label">Location</span>
                <span className="card-row-value">{event.location}</span>
            </div>

            <div className="card-row">
                <span className="card-row-label">Coordinator</span>
                <span className="card-row-value">{event.coordinator}</span>
            </div>

            {event.description && (
                <p className="status-text" style={{ marginTop: "12px", textAlign: "left" }}>
                    {event.description}
                </p>
            )}

            {canDelete && (
                <button
                    type="button"
                    className="btn-retry"
                    style={{ marginTop: "12px" }}
                    onClick={() => onDelete(event._id)}
                    disabled={isDeleting}
                >
                    {isDeleting ? "Deleting..." : "Delete Event"}
                </button>
            )}

        </div>
    );

}

export default EventCard;