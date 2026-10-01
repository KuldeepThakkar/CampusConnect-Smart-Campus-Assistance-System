require("dotenv").config();
const mongoose = require("mongoose");
const Event = require("./src/models/event.model");

async function run() {
    await mongoose.connect(process.env.MONGODB_URI);

    const event = await Event.create({
        eventName: "Tech Fest 2026",
        eventDate: "2026-10-15",
        eventTime: "10:00",
        location: "Main Auditorium",
        description: "Annual tech showcase",
        coordinator: "Prof. Sharma",
        createdBy: "6a86f567b557ffe7854d9ca4"
    });

    console.log(event);

    await mongoose.disconnect();
}

run().catch(console.error);