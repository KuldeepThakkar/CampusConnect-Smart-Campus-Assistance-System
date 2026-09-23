const ALLOWED_EMAIL_DOMAINS = require("../config/allowedDomains");

function getEmailDomain(email) {

    const parts = email.trim().toLowerCase().split("@");

    if (parts.length !== 2) {
        return null;
    }

    return parts[1];

}

function isAllowedDomain(email) {

    const domain = getEmailDomain(email);

    if (!domain) {
        return false;
    }

    return ALLOWED_EMAIL_DOMAINS.includes(domain);

}

// Matches the student pattern: name.batchyear.branch@domain
// e.g. krishpatel.23.ce@iite.indusuni.ac.in
const STUDENT_EMAIL_PATTERN = /^[a-zA-Z]+\.(\d{2})\.([a-zA-Z]+)@/;

function parseStudentEmail(email) {

    const match = email.trim().toLowerCase().match(STUDENT_EMAIL_PATTERN);

    if (!match) {
        return null;
    }

    return {
        batchYear: match[1],
        branch: match[2]
    };

}

module.exports = {
    isAllowedDomain,
    parseStudentEmail
};