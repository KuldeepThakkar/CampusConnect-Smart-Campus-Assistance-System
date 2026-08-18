// test-user-model.js
require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./src/models/user.model");

async function run() {

    await mongoose.connect(process.env.MONGODB_URI);

    const testUser = await User.create({
        email: "test.25.ce@iite.indusuni.ac.in",
        password: "temporary_plain_text_for_now",
        role: "student"
    });

    console.log("Created:", testUser);

    await User.deleteOne({ _id: testUser._id });

    console.log("Cleaned up test user");

    await mongoose.disconnect();

}

run();