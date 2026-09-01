function buildTimeline(classroomData) {

    const busyEntries = classroomData.busy.map((entry) => ({ ...entry, type: "busy" }));
    const freeEntries = classroomData.free.map((entry) => ({ ...entry, type: "free" }));

    return [...busyEntries, ...freeEntries].sort(
        (a, b) => a.startTime.localeCompare(b.startTime)
    );

}

function ClassroomDayResults({ data }) {

    if (!data || !data.buildings || data.buildings.length === 0) {
        return <p className="status-text">No classroom data found for this search.</p>;
    }

    return (
        <div className="results">
            {data.buildings.map((building) => (
                <div key={building.buildingId} className="card">

                    <div className="card-header">
                        <h2>{building.buildingName}</h2>
                        <span className="badge badge-upcoming">
                            {building.classrooms.length} Rooms
                        </span>
                    </div>

                    {building.classrooms.map((classroomData) => {

                        const timeline = buildTimeline(classroomData);
                        const freeSlotCount = classroomData.free.length;

                        return (
                            <details key={classroomData.classroom} className="classroom-block">

                                <summary>
                                    <span>{classroomData.classroom}</span>
                                    <span className="badge badge-ongoing">
                                        {freeSlotCount} free slot{freeSlotCount !== 1 ? "s" : ""}
                                    </span>
                                </summary>

                                <div>
                                    {timeline.map((block, index) => (
                                        <div key={index} className="timeline-row">
                                            <span className="timeline-time">
                                                {block.startTime} – {block.endTime}
                                            </span>
                                            <span className={`timeline-dot ${block.type}`} />
                                            <span className="timeline-label">
                                                {block.type === "free"
                                                    ? "Free"
                                                    : `${block.subject} — ${block.faculty}`}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                            </details>
                        );

                    })}

                </div>
            ))}
        </div>
    );

}

export default ClassroomDayResults;