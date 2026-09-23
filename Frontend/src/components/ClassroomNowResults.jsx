function ClassroomNowResults({ data }) {

    if (!data || !data.buildings || data.buildings.length === 0) {
        return <p className="status-text">No classroom data found for this search.</p>;
    }

    return (
        <div className="results">
            {data.buildings.map((building) => (
                <div key={building.buildingId} className="card">

                    <div className="card-header">
                        <h2>{building.buildingName}</h2>
                        <span className="badge badge-ongoing">
                            {building.freeClassrooms.length} Free
                        </span>
                    </div>

                    {building.freeClassrooms.length > 0 ? (
                        <div className="chip-group">
                            {building.freeClassrooms.map((room) => (
                                <span key={room} className="chip chip-free">{room}</span>
                            ))}
                        </div>
                    ) : (
                        <p className="status-text">No free classrooms right now.</p>
                    )}

                    {building.busyClassrooms.length > 0 && (
                        <details className="busy-details">
                            <summary>{building.busyClassrooms.length} in use</summary>
                            <div className="chip-group">
                                {building.busyClassrooms.map((room) => (
                                    <span key={room} className="chip chip-busy">{room}</span>
                                ))}
                            </div>
                        </details>
                    )}

                </div>
            ))}
        </div>
    );

}

export default ClassroomNowResults;