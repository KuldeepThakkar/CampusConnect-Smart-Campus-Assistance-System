function NextLectureCard({ lecture, status }) {

    if (!lecture) {
        return null;
    }

    return (
        <div>
            <h2>Next Lecture</h2>

            <p><strong>Status:</strong> {status}</p>
            <p><strong>Subject:</strong> {lecture.subject}</p>
            <p><strong>Faculty:</strong> {lecture.faculty}</p>
            <p><strong>Classroom:</strong> {lecture.classroom}</p>
            <p>
                <strong>Time:</strong>{" "}
                {lecture.startTime} - {lecture.endTime}
            </p>
        </div>
    );
}

export default NextLectureCard;