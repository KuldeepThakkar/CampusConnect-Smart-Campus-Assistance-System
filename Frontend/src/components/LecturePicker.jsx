function LecturePicker({ lectures, selectedLecture, onSelect }) {

    if (!lectures || lectures.length === 0) {
        return (
            <div className="card">
                <div className="card-header">
                    <h2>Today's Lectures</h2>
                </div>
                <p className="status-text">No lectures scheduled for today.</p>
            </div>
        );
    }

    return (
        <div className="card">

            <div className="card-header">
                <h2>Today's Lectures</h2>
            </div>

            {lectures.map((lecture) => {

                const isSelected = selectedLecture
                    && selectedLecture.startTime === lecture.startTime
                    && selectedLecture.classroom === lecture.classroom;

                return (
                    <button
                        key={`${lecture.startTime}-${lecture.classroom}`}
                        type="button"
                        onClick={() => onSelect(lecture)}
                        className="card-row"
                        style={{
                            width: "100%",
                            background: isSelected ? "rgba(45, 156, 219, 0.1)" : "transparent",
                            border: "none",
                            cursor: "pointer",
                            textAlign: "left"
                        }}
                    >
                        <span className="card-row-label">
                            {lecture.startTime} - {lecture.endTime}
                        </span>
                        <span className="card-row-value">
                            {lecture.subject} · {lecture.classroom}
                        </span>
                    </button>
                );

            })}

        </div>
    );

}

export default LecturePicker;