// require("dotenv").config();
// const mongoose = require("mongoose");
// const reservationService = require("./src/services/reservation.service");
// const User = require("./src/models/user.model");

// async function run() {
//     await mongoose.connect(process.env.MONGODB_URI);

//     // Replace with a real teacher _id from your DB
//     const teacherId = "6a84547e1ce2706d23333aa9";

//     // 1. Pick a classroom + time range you know is NOT in today's timetable for that room
//     const result1 = await reservationService.createReservation(teacherId, {
//         classroom: "LH-17",
//         buildingId: "B4",
//         date: new Date().toLocaleDateString("en-CA"),
//         startTime: "10:00",
//         endTime: "10:50"
//     });
//     console.log("Test 1 (should succeed):", result1);

//     // // 2. Try the exact same range again — should fail as "already reserved"
//     // const result2 = await reservationService.createReservation(teacherId, {
//     //     classroom: "LH-33",
//     //     buildingId: "B4",
//     //     date: new Date().toLocaleDateString("en-CA"),
//     //     startTime: "09:10",
//     //     endTime: "10:00"
//     // });
//     // console.log("Test 2 (should fail - room conflict):", result2);

//     // // 3. Different room, same teacher, overlapping time — should fail as "you already have a slot"
//     // const result3 = await reservationService.createReservation(teacherId, {
//     //     classroom: "LH-34",
//     //     buildingId: "B4",
//     //     date: new Date().toLocaleDateString("en-CA"),
//     //     startTime: "09:10",
//     //     endTime: "10:00"
//     // });
//     // console.log("Test 3 (should fail - teacher conflict):", result3);

//     // // 4. Try a classroom during a real lecture slot from timetable.json — should fail as timetable clash
//     // const result4 = await reservationService.createReservation(teacherId, {
//     //     classroom: "LH-1",
//     //     buildingId: "B4",
//     //     date: new Date().toLocaleDateString("en-CA"),
//     //     startTime: "10:00",
//     //     endTime: "10:50"
//     // });
//     // console.log("Test 4 (should fail - timetable clash):", result4);

//     // 5. getReservationsForToday / getTeacherReservationsToday sanity check
//     console.log("All today's reservations:", await reservationService.getReservationsForToday());
//     console.log("This teacher's today:", await reservationService.getTeacherReservationsToday(teacherId));

//     await mongoose.disconnect();
// }

// run().catch(console.error);

const timetableService = require("./src/services/timetable.service");
const raw = timetableService.getRawTimetable();



console.log(Object.keys(raw[0].schedule));