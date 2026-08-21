const User = require("../models/user.model");

async function setAcademicDetails(userId, academicDetails) {

    const user = await User.findById(userId);

    if (!user) {
        return { success: false, message: "User not found" };
    }

    if (user.role !== "student") {
        return { success: false, message: "Only students have academic details" };
    }

    if (user.academicDetails.isLocked) {
        return { success: false, message: "Academic details are already locked. Contact admin to change them." };
    }

    const { department, branch, semester, division } = academicDetails;

    user.academicDetails = {
        department,
        branch,
        semester: Number(semester),
        division,
        isLocked: true
    };

    await user.save();

    return {
        success: true,
        message: "Academic details saved and locked",
        academicDetails: user.academicDetails
    };

}

async function adminUpdateAcademicDetails(targetUserId, updates) {

    const user = await User.findById(targetUserId);

    if (!user) {
        return { success: false, message: "User not found" };
    }

    if (user.role !== "student") {
        return { success: false, message: "Only students have academic details" };
    }

    const { department, branch, semester, division, isLocked } = updates;

    if (department !== undefined) user.academicDetails.department = department;
    if (branch !== undefined) user.academicDetails.branch = branch;
    if (semester !== undefined) user.academicDetails.semester = Number(semester);
    if (division !== undefined) user.academicDetails.division = division;
    if (isLocked !== undefined) user.academicDetails.isLocked = isLocked;

    await user.save();

    return {
        success: true,
        message: "Academic details updated by admin",
        academicDetails: user.academicDetails
    };

}

module.exports = {
    setAcademicDetails,
    adminUpdateAcademicDetails
};