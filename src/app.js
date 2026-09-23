const express = require('express');
const app = express();
const campusRoutes = require("./routes/campus.routes");
const navigationRoutes = require("./routes/navigation.routes");
const classroomRoutes = require("./routes/classroom.routes");

app.use(express.json());


app.use("/api/campus", campusRoutes);
app.use("/api/navigation", navigationRoutes);
app.use("/api/classroom", classroomRoutes);

module.exports = app;