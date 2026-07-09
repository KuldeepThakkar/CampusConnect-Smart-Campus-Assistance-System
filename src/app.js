const express = require('express');
const app = express();
const campusRoutes = require("./routes/campus.routes");
const navigationRoutes = require("./routes/navigation.routes");

app.use(express.json());


app.use("/api/campus", campusRoutes);
app.use("/api/navigation", navigationRoutes);

module.exports = app;