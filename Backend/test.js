// test-email-util.js
const { isAllowedDomain, parseStudentEmail } = require("./src/utils/email.util");

console.log(isAllowedDomain("krishpatel.23.ce@iite.indusuni.ac.in")); // true
console.log(isAllowedDomain("cse.hod@indusuni.ac.in")); // true
console.log(isAllowedDomain("student@gmail.com")); // false
console.log(isAllowedDomain("student@evilindusuni.ac.in")); // false — confirms the exact-match protection

console.log(parseStudentEmail("krishpatel.23.ce@iite.indusuni.ac.in"));
// { batchYear: '23', branch: 'ce' }

console.log(parseStudentEmail("director@iite.indusuni.ac.in"));
// null — no crash, just no match