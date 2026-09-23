function NextLectureCard({ lecture, status }) {

    if (!lecture) {
        return null;
    }

    const isOngoing = status === "ONGOING";

    return (
        <div className="card">
            <div className="card-header">
                <h2>Next Lecture</h2>
                <span className={`badge ${isOngoing ? "badge-ongoing" : "badge-upcoming"}`}>
                    {status}
                </span>
            </div>

            <div className="card-row">
                <span className="card-row-label">Subject</span>
                <span className="card-row-value">{lecture.subject}</span>
            </div>

            <div className="card-row">
                <span className="card-row-label">Faculty</span>
                <span className="card-row-value">{lecture.faculty}</span>
            </div>

            <div className="card-row">
                <span className="card-row-label">Classroom</span>
                <span className="card-row-value">{lecture.classroom}</span>
            </div>

            <div className="card-row">
                <span className="card-row-label">Time</span>
                <span className="card-row-value mono">
                    {lecture.startTime} - {lecture.endTime}
                </span>
            </div>
        </div>
    );

}

export default NextLectureCard;