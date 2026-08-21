const express = require('express');
const cors = require('cors')
const app = express();
const campusRoutes = require("./routes/campus.routes");
const navigationRoutes = require("./routes/navigation.routes");
const timetableRoutes = require("./routes/timetable.routes");
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");


app.use(express.json());
app.use(
    cors({
        origin: "http://localhost:5173",
    })
);

app.use("/api/campus", campusRoutes);
app.use("/api/navigation", navigationRoutes);
app.use("/api/timetable", timetableRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);

module.exports = app;