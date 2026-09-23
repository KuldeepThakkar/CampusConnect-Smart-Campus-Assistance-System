// Run with: node test/decisionEngine.test.js
// No DB connection needed — decisionEngine.service.js is pure, so these are
// straight unit tests against dummy scenarios. Deliberately not waiting on
// real timetable/report data: this validates the RULES, which don't change
// once real data arrives — only the thresholds get calibrated later.

const assert = require("assert");
const { resolveRoomStatus, STATUS } = require("./decisionEngine.service");

const NOW = new Date("2026-09-23T10:00:00Z");

function minutesAgo(mins) {
    return new Date(NOW.getTime() - mins * 60 * 1000);
}

function vote(userId, type, { verified = true, ageMinutes = 1 } = {}) {
    return {
        type,
        reportedBy: userId,
        verifiedNearRoom: verified,
        createdAt: minutesAgo(ageMinutes)
    };
}

let passed = 0;
let failed = 0;

function test(name, fn) {
    try {
        fn();
        console.log(`PASS  ${name}`);
        passed++;
    } catch (err) {
        console.log(`FAIL  ${name}`);
        console.log(`      ${err.message}`);
        failed++;
    }
}

// 1. Baseline: timetable says busy, nothing else -> SCHEDULED / occupied
test("scheduled class with no reports stays SCHEDULED", () => {
    const result = resolveRoomStatus({ timetableBusy: true, hasActiveReservation: false, reports: [], now: NOW });
    assert.strictEqual(result.status, STATUS.SCHEDULED);
    assert.strictEqual(result.occupied, true);
    assert.strictEqual(result.confidence, "high");
});

// 2. Reservation always wins, even with contradicting reports
test("active reservation overrides everything, including 'empty' reports", () => {
    const reports = [vote("u1", "empty"), vote("u2", "empty"), vote("u3", "empty")];
    const result = resolveRoomStatus({ timetableBusy: false, hasActiveReservation: true, reports, now: NOW });
    assert.strictEqual(result.status, STATUS.RESERVED);
    assert.strictEqual(result.occupied, true);
});

// 3. Cancellation override: exactly 3 distinct verified votes flips it
test("3 verified 'empty' votes override a scheduled class", () => {
    const reports = [vote("u1", "empty"), vote("u2", "empty"), vote("u3", "empty")];
    const result = resolveRoomStatus({ timetableBusy: true, hasActiveReservation: false, reports, now: NOW });
    assert.strictEqual(result.status, STATUS.REPORTED_FREE);
    assert.strictEqual(result.occupied, false);
    assert.strictEqual(result.confidence, "medium");
});

// 4. Below threshold: only 2 votes -> stays SCHEDULED
test("2 verified 'empty' votes are NOT enough to override", () => {
    const reports = [vote("u1", "empty"), vote("u2", "empty")];
    const result = resolveRoomStatus({ timetableBusy: true, hasActiveReservation: false, reports, now: NOW });
    assert.strictEqual(result.status, STATUS.SCHEDULED);
    assert.strictEqual(result.occupied, true);
});

// 5. Anti-vote-stuffing: same user voting 5 times only counts as 1
test("vote-stuffing by a single user does not reach the threshold", () => {
    const reports = [
        vote("u1", "empty"), vote("u1", "empty"), vote("u1", "empty"),
        vote("u1", "empty"), vote("u1", "empty")
    ];
    const result = resolveRoomStatus({ timetableBusy: true, hasActiveReservation: false, reports, now: NOW });
    assert.strictEqual(result.status, STATUS.SCHEDULED, "5 votes from 1 user should still count as 1 distinct voter");
});

// 6. Unverified-location votes are rejected outright
test("unverified-location votes never count, even 3+ of them", () => {
    const reports = [
        vote("u1", "empty", { verified: false }),
        vote("u2", "empty", { verified: false }),
        vote("u3", "empty", { verified: false })
    ];
    const result = resolveRoomStatus({ timetableBusy: true, hasActiveReservation: false, reports, now: NOW });
    assert.strictEqual(result.status, STATUS.SCHEDULED);
});

// 7. Mixed verified/unverified: only verified ones count toward threshold
test("mix of verified and unverified votes only counts the verified ones", () => {
    const reports = [
        vote("u1", "empty", { verified: true }),
        vote("u2", "empty", { verified: true }),
        vote("u3", "empty", { verified: false }) // doesn't count
    ];
    const result = resolveRoomStatus({ timetableBusy: true, hasActiveReservation: false, reports, now: NOW });
    assert.strictEqual(result.status, STATUS.SCHEDULED, "only 2 verified votes present, should not override");
});

// 8. Stale votes outside the 15-minute window are ignored
test("votes older than the override window do not count", () => {
    const reports = [
        vote("u1", "empty", { ageMinutes: 20 }),
        vote("u2", "empty", { ageMinutes: 25 }),
        vote("u3", "empty", { ageMinutes: 30 })
    ];
    const result = resolveRoomStatus({ timetableBusy: true, hasActiveReservation: false, reports, now: NOW });
    assert.strictEqual(result.status, STATUS.SCHEDULED, "all votes are stale, should not override");
});

// 9. Unscheduled-use report: free room + 3 verified 'occupied' votes -> REPORTED_OCCUPIED
test("3 verified 'occupied' votes flip a free room to REPORTED_OCCUPIED", () => {
    const reports = [vote("u1", "occupied"), vote("u2", "occupied"), vote("u3", "occupied")];
    const result = resolveRoomStatus({ timetableBusy: false, hasActiveReservation: false, reports, now: NOW });
    assert.strictEqual(result.status, STATUS.REPORTED_OCCUPIED);
    assert.strictEqual(result.occupied, true);
});

// 10. Plain free room, no signals at all
test("no schedule, no reservation, no reports -> FREE", () => {
    const result = resolveRoomStatus({ timetableBusy: false, hasActiveReservation: false, reports: [], now: NOW });
    assert.strictEqual(result.status, STATUS.FREE);
    assert.strictEqual(result.occupied, false);
    assert.strictEqual(result.confidence, "high");
});

// 11. Occupancy percent: normal case
test("occupancy percent computes count/seats", () => {
    const result = resolveRoomStatus({
        timetableBusy: true, hasActiveReservation: false, reports: [], now: NOW,
        headcount: 30, seats: 60
    });
    assert.strictEqual(result.occupancyPercent, 50);
});

// 12. Occupancy percent: capped at 100, no "+20" overflow allowance
//     (resolves the open question from ADR notes — headroom was NOT kept)
test("occupancy percent is capped at 100, headcount over capacity does not overflow", () => {
    const result = resolveRoomStatus({
        timetableBusy: true, hasActiveReservation: false, reports: [], now: NOW,
        headcount: 85, seats: 60 // would be 141% uncapped, or 108% under a seats+20 rule
    });
    assert.strictEqual(result.occupancyPercent, 100);
});

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed === 0 ? 0 : 1);
