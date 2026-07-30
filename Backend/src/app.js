const express = require('express');
const cors = require('cors')
const app = express();
const campusRoutes = require("./routes/campus.routes");
const navigationRoutes = require("./routes/navigation.routes");
const timetableRoutes = require("./routes/timetable.routes");


app.use(express.json());
app.use(
    cors({
        origin: "http://localhost:5173",
    })
);

app.use("/api/campus", campusRoutes);
app.use("/api/navigation", navigationRoutes);
app.use("/api/timetable", timetableRoutes);

module.exports = app;