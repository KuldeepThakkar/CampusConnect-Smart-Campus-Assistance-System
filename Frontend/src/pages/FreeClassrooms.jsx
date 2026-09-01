import { useEffect, useState } from "react";

import { getFreeClassroomsNow, getDaySchedule, getBuildingsWithClassrooms } from "../services/classroom";

import ClassroomNowResults from "../components/ClassroomNowResults";
import ClassroomDayResults from "../components/ClassroomDayResults";
import { Link } from "react-router-dom";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function getTodayName() {
    return new Date().toLocaleDateString("en-US", { weekday: "long" });
}

function getCurrentTimeValue() {

    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");

    return `${hours}:${minutes}`;

}

function FreeClassrooms() {

    const [mode, setMode] = useState("now");
    const [day, setDay] = useState(getTodayName());
    const [time, setTime] = useState(getCurrentTimeValue());
    const [building, setBuilding] = useState("");

    const [buildings, setBuildings] = useState([]);

    const [results, setResults] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);

    const fetchBuildings = async () => {

        try {

            const list = await getBuildingsWithClassrooms();
            setBuildings(list);

        } catch (error) {
            console.error(error);
        }

    };

    useEffect(() => {
        fetchBuildings();
    }, []);

    const handleSearch = async () => {

        setIsLoading(true);
        setErrorMessage(null);
        setResults(null);

        try {

            const response = mode === "now"
                ? await getFreeClassroomsNow({ day, time, building: building || undefined })
                : await getDaySchedule({ day, building: building || undefined });

            setResults(response.data);

        } catch (error) {

            if (error.response) {
                setErrorMessage(error.response.data.message || "Couldn't load classrooms.");
            } else {
                setErrorMessage("Something went wrong. Please check your connection.");
            }

        } finally {
            setIsLoading(false);
        }

    };

    return (
        <div>
            <Link to="/" className="btn-retry" style={{ display: "inline-block", marginBottom: "16px", textDecoration: "none" }}>
                ← Home
            </Link>
            <h2>Free Classrooms</h2>

            <div className="field">
                <label>View</label>
                <div className="toggle-group">
                    <button
                        type="button"
                        className={`toggle-option ${mode === "now" ? "active" : ""}`}
                        onClick={() => setMode("now")}
                        disabled={isLoading}
                    >
                        Right Now
                    </button>
                    <button
                        type="button"
                        className={`toggle-option ${mode === "day" ? "active" : ""}`}
                        onClick={() => setMode("day")}
                        disabled={isLoading}
                    >
                        Whole Day
                    </button>
                </div>
            </div>

            <div className="field">
                <label htmlFor="day">Day</label>
                <select id="day" value={day} onChange={(e) => setDay(e.target.value)} disabled={isLoading}>
                    {DAYS.map((d) => (
                        <option key={d} value={d}>{d}</option>
                    ))}
                </select>
            </div>

            {mode === "now" && (
                <div className="field">
                    <label htmlFor="time">Time</label>
                    <input
                        id="time"
                        type="time"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        disabled={isLoading}
                    />
                </div>
            )}

            <div className="field">
                <label htmlFor="building">Building</label>
                <select id="building" value={building} onChange={(e) => setBuilding(e.target.value)} disabled={isLoading}>
                    <option value="">All Buildings</option>
                    {buildings.map((b) => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                </select>
            </div>

            <button type="button" className="btn-primary" onClick={handleSearch} disabled={isLoading}>
                {isLoading ? "Searching..." : "Search"}
            </button>

            {errorMessage && (
                <div className="error-box">
                    <p>{errorMessage}</p>
                </div>
            )}

            {results && mode === "now" && (
                <ClassroomNowResults data={results} />
            )}

            {results && mode === "day" && (
                <ClassroomDayResults data={results} />
            )}

        </div>
    );

}

export default FreeClassrooms;