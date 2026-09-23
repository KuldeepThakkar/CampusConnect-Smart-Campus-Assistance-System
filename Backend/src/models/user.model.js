const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        password: {
            type: String,
            required: true
        },
        role: {
            type: String,
            enum: ["student", "teacher", "admin"],
            required: true
        },
        isVerified: {
            type: Boolean,
            default: false
        },
        otp: {
            code: {
                type: String,
                default: null
            },
            adminCode: {
                type: String,
                default: null
            },
            expiresAt: {
                type: Date,
                default: null
            }
        },
        academicDetails: {
            department: { type: String, default: null },
            branch: { type: String, default: null },
            semester: { type: Number, default: null },
            division: { type: String, default: null },
            isLocked: { type: Boolean, default: false }
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("User", userSchema);