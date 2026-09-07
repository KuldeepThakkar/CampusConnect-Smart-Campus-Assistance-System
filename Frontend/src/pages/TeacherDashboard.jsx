import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getClassroomSlots, getBuildingsWithClassrooms } from "../services/classroom";
import { createReservation, getMyReservations,cancelReservation  } from "../services/reservation";

function getTodayName() {
    return new Date().toLocaleDateString("en-US", { weekday: "long" });
}

function getTodayDateString() {
    return new Date().toLocaleDateString("en-CA");
}

function TeacherDashboard() {

    const [building, setBuilding] = useState("");
    const [buildings, setBuildings] = useState([]);

    const [slotData, setSlotData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);

    const [myReservations, setMyReservations] = useState([]);
    const [isLoadingReservations, setIsLoadingReservations] = useState(false);

    const [reservingKey, setReservingKey] = useState(null);
    const [reserveError, setReserveError] = useState(null);
    const [reserveSuccess, setReserveSuccess] = useState(null);

    const [cancellingId, setCancellingId] = useState(null);

    const fetchBuildings = async () => {

        try {

            const list = await getBuildingsWithClassrooms();
            setBuildings(list);

        } catch (error) {
            console.error(error);
        }

    };

    const loadSlots = async () => {

        setIsLoading(true);
        setErrorMessage(null);

        try {

            const response = await getClassroomSlots({
                day: getTodayName(),
                building: building || undefined
            });

            setSlotData(response.data);

        } catch (error) {

            if (error.response) {
                setErrorMessage(error.response.data.message || "Couldn't load today's slots.");
            } else {
                setErrorMessage("Something went wrong. Please check your connection.");
            }

        } finally {
            setIsLoading(false);
        }

    };

    const loadMyReservations = async () => {

        setIsLoadingReservations(true);

        try {

            const response = await getMyReservations();
            setMyReservations(response.data.reservations);

        } catch (error) {
            console.error(error);
        } finally {
            setIsLoadingReservations(false);
        }

    };

    useEffect(() => {
        fetchBuildings();
        loadSlots();
        loadMyReservations();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleReserve = async (classroom, buildingId, startTime, endTime) => {

        setReserveError(null);
        setReserveSuccess(null);
        setReservingKey(`${classroom}-${startTime}-${endTime}`);

        try {

            await createReservation({
                classroom,
                buildingId,
                date: getTodayDateString(),
                startTime,
                endTime
            });

            await loadSlots();
            await loadMyReservations();

            setReserveSuccess(`${classroom} reserved from ${startTime} to ${endTime}.`);

        } catch (error) {

            if (error.response) {
                setReserveError(error.response.data.message || "Couldn't reserve this classroom.");
            } else {
                setReserveError("Something went wrong. Please check your connection.");
            }

        } finally {
            setReservingKey(null);
        }

    };

    const handleCancel = async (id) => {

        setReserveError(null);
        setReserveSuccess(null);
        setCancellingId(id);

        try {

            await cancelReservation(id);

            await loadSlots();
            await loadMyReservations();

            setReserveSuccess("Reservation cancelled.");

        } catch (error) {

            if (error.response) {
                setReserveError(error.response.data.message || "Couldn't cancel this reservation.");
            } else {
                setReserveError("Something went wrong. Please check your connection.");
            }

        } finally {
            setCancellingId(null);
        }

    };

    return (
        <div>
            <Link to="/" className="btn-retry" style={{ display: "inline-block", marginBottom: "16px", textDecoration: "none" }}>
                ← Home
            </Link>
            <h2>Reserve a Classroom</h2>

            <div className="card">

                <div className="card-header">
                    <h2>Your Reservations Today</h2>
                </div>

                {isLoadingReservations ? (
                    <p className="status-text">Loading...</p>
                ) : myReservations.length === 0 ? (
                    <p className="status-text">You have no reservations today.</p>
                ) : (
                    <div className="chip-group">
                        {myReservations.map((reservation) => (
                            <button
                                key={reservation._id}
                                type="button"
                                className="chip chip-busy"
                                style={{ cursor: "pointer", border: "none" }}
                                disabled={cancellingId === reservation._id}
                                onClick={() => handleCancel(reservation._id)}
                            >
                                {cancellingId === reservation._id
                                    ? "Cancelling..."
                                    : `${reservation.classroom}: ${reservation.startTime} – ${reservation.endTime} ✕`}
                            </button>
                        ))}
                    </div>
                )}

            </div>

            <p className="status-text">Showing today's fixed period slots. Reservations are only available for today.</p>

            <div className="field">
                <label htmlFor="building">Building</label>
                <select id="building" value={building} onChange={(e) => setBuilding(e.target.value)} disabled={isLoading}>
                    <option value="">All Buildings</option>
                    {buildings.map((b) => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                </select>
            </div>

            <button type="button" className="btn-primary" onClick={loadSlots} disabled={isLoading}>
                {isLoading ? "Loading..." : "Refresh"}
            </button>

            {errorMessage && (
                <div className="error-box">
                    <p>{errorMessage}</p>
                </div>
            )}

            {reserveSuccess && (
                <div className="field">
                    <p className="status-text" style={{ color: "var(--success)" }}>{reserveSuccess}</p>
                </div>
            )}

            {reserveError && (
                <div className="error-box">
                    <p>{reserveError}</p>
                </div>
            )}

            {slotData && (
                <div className="results">

                    {slotData.buildings.length === 0 && (
                        <p className="status-text">No classroom data found.</p>
                    )}

                    {slotData.buildings.map((buildingResult) => (
                        <div key={buildingResult.buildingId} className="card">

                            <div className="card-header">
                                <h2>{buildingResult.buildingName}</h2>
                            </div>

                            {buildingResult.classrooms.map((room) => (
                                <div key={room.classroom} style={{ marginBottom: "16px" }}>

                                    <p style={{ fontWeight: 600, marginBottom: "8px" }}>{room.classroom}</p>

                                    {room.slots.length === 0 ? (
                                        <p className="status-text">No period slots found for today.</p>
                                    ) : (
                                        <div className="chip-group">
                                            {room.slots.map((slot) => {

                                                const key = `${room.classroom}-${slot.startTime}-${slot.endTime}`;
                                                const isReservingThis = reservingKey === key;

                                                return slot.free ? (
                                                    <button
                                                        key={key}
                                                        type="button"
                                                        className="chip chip-free"
                                                        style={{ cursor: "pointer", border: "none" }}
                                                        disabled={reservingKey !== null}
                                                        onClick={() => handleReserve(room.classroom, buildingResult.buildingId, slot.startTime, slot.endTime)}
                                                    >
                                                        {isReservingThis ? "Reserving..." : `${slot.startTime} – ${slot.endTime}`}
                                                    </button>
                                                ) : (
                                                    <span key={key} className="chip chip-busy">
                                                        {slot.startTime} – {slot.endTime}
                                                    </span>
                                                );

                                            })}
                                        </div>
                                    )}

                                </div>
                            ))}

                        </div>
                    ))}

                </div>
            )}

        </div>
    );

}

export default TeacherDashboard;