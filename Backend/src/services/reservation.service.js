const Reservation = require("../models/reservation.model");
const timetableService = require("./timetable.service");
const { timeToMinutes } = require("../utils/time.util");

// Local-time "YYYY-MM-DD", consistent with how the rest of the codebase
// (timetable.service.js) derives "today" via local Date methods rather than UTC.
function getTodayDateString(currentDate = new Date()) {
    return currentDate.toLocaleDateString("en-CA");
}

function getTodayDayName(currentDate = new Date()) {
    return currentDate.toLocaleDateString("en-US", { weekday: "long" });
}

// [aStart,aEnd) overlaps [bStart,bEnd) iff aStart < bEnd && bStart < aEnd
function rangesOverlap(aStart, aEnd, bStart, bEnd) {
    return aStart < bEnd && bStart < aEnd;
}

async function createReservation(teacherId, { classroom, buildingId, date, startTime, endTime }) {

    const todayDateStr = getTodayDateString();

    if (date !== todayDateStr) {

        return {
            success: false,
            message: "Reservations can only be made for today"
        };

    }

    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);

    if (startMinutes >= endMinutes) {

        return {
            success: false,
            message: "Start time must be before end time"
        };

    }

    const day = getTodayDayName();

    // 1. Room must not collide with an actual scheduled lecture
    const clashesWithTimetable = timetableService.isClassroomBusyInRange(
        day,
        classroom,
        startTime,
        endTime
    );

    if (clashesWithTimetable) {

        return {
            success: false,
            message: "This classroom has a scheduled class during that time"
        };

    }

    // 2. Room must not already be reserved by someone else in an overlapping range today
    const existingRoomReservations = await Reservation.find({
        date: todayDateStr,
        classroom
    });

    const roomAlreadyReserved = existingRoomReservations.some((reservation) =>
        rangesOverlap(
            startMinutes,
            endMinutes,
            timeToMinutes(reservation.startTime),
            timeToMinutes(reservation.endTime)
        )
    );

    if (roomAlreadyReserved) {

        return {
            success: false,
            message: "This classroom is already reserved during that time"
        };

    }

    // 3. Teacher must not already hold an overlapping reservation today (any room)
    const existingTeacherReservations = await Reservation.find({
        date: todayDateStr,
        teacher: teacherId
    });

    const teacherAlreadyBooked = existingTeacherReservations.some((reservation) =>
        rangesOverlap(
            startMinutes,
            endMinutes,
            timeToMinutes(reservation.startTime),
            timeToMinutes(reservation.endTime)
        )
    );

    if (teacherAlreadyBooked) {

        return {
            success: false,
            message: "You already have a reservation during that time"
        };

    }

    const reservation = await Reservation.create({
        teacher: teacherId,
        classroom,
        buildingId,
        date: todayDateStr,
        day,
        startTime,
        endTime
    });

    return {
        success: true,
        message: "Classroom reserved successfully",
        reservation
    };

}

// All of today's reservations — consumed by freeClassroom.service.js (C.3)
// to filter reserved rooms out of student-facing results.
async function getReservationsForToday() {

    const todayDateStr = getTodayDateString();

    return Reservation.find({ date: todayDateStr });

}

async function getTeacherReservationsToday(teacherId) {

    const todayDateStr = getTodayDateString();

    return Reservation.find({ date: todayDateStr, teacher: teacherId }).sort({ startTime: 1 });

}

module.exports = {
    createReservation,
    getReservationsForToday,
    getTeacherReservationsToday
};