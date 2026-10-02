function EventCard({ event }) {

    return (
        <div className="card">

            <div className="card-header">
                <h2>{event.eventName}</h2>
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

        </div>
    );

}

export default EventCard;