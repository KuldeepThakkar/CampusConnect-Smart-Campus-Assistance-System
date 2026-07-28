/**
 * room-status-engine.test.ts
 * ---------------------------------------------------------
 * Manual test scenarios proving the hybrid algorithm works
 * against the dummy timetable. Run with: npx ts-node test/room-status-engine.test.ts
 * (once the real repo has ts-node/jest set up — this is plain
 * assertions for now so it runs with zero test-framework setup.)
 * ---------------------------------------------------------
 */

import {
  getRoomStatus,
  calculateOccupancyPercent,
  TimetableEntry,
  CancellationVote,
  OccupancyReport,
} from "./room-status-engine";

declare const require: any;
declare const process: any;

const timetableData = require("./dummy-timetable.json");
const timetable: TimetableEntry[] = timetableData.entries;

function assert(condition: boolean, label: string) {
  if (condition) {
    console.log(`✅ ${label}`);
  } else {
    console.error(`❌ FAILED: ${label}`);
    process.exitCode = 1;
  }
}

// Monday 09:30 — MAIN-G-01 has Data Structures 09:00-10:00 scheduled
const mondayInClass = new Date("2026-06-29T09:30:00"); // 2026-06-29 is a Monday

// --- Scenario 1: plain OCCUPIED, no votes, no reports -------------
{
  const status = getRoomStatus(
    "MAIN-G-01",
    mondayInClass,
    timetable,
    [],
    []
  );
  assert(status.state === "OCCUPIED", "Scenario 1: room with active class shows OCCUPIED");
}

// --- Scenario 2: room with nothing scheduled -> AVAILABLE ----------
{
  // MAIN-G-03 only has DBMS Lab 11:00-13:00, nothing at 09:30
  const status = getRoomStatus(
    "MAIN-G-03",
    mondayInClass,
    timetable,
    [],
    []
  );
  assert(status.state === "AVAILABLE", "Scenario 2: room with no scheduled class shows AVAILABLE");
}

// --- Scenario 3: cancelled lecture, below quorum (2 votes) ---------
{
  const votes: CancellationVote[] = [
    { roomId: "MAIN-G-01", votedAt: mondayInClass, userId: "u1", verifiedNearRoom: true },
    { roomId: "MAIN-G-01", votedAt: mondayInClass, userId: "u2", verifiedNearRoom: true },
  ];
  const status = getRoomStatus("MAIN-G-01", mondayInClass, timetable, votes, []);
  assert(
    status.state === "OCCUPIED",
    "Scenario 3: only 2 of 3 required votes -> still OCCUPIED (quorum not met)"
  );
}

// --- Scenario 4: cancelled lecture, quorum met (3 votes) -----------
{
  const votes: CancellationVote[] = [
    { roomId: "MAIN-G-01", votedAt: mondayInClass, userId: "u1", verifiedNearRoom: true },
    { roomId: "MAIN-G-01", votedAt: mondayInClass, userId: "u2", verifiedNearRoom: true },
    { roomId: "MAIN-G-01", votedAt: mondayInClass, userId: "u3", verifiedNearRoom: true },
  ];
  const status = getRoomStatus("MAIN-G-01", mondayInClass, timetable, votes, []);
  assert(
    status.state === "LIKELY_FREE",
    "Scenario 4: 3 verified votes -> overrides timetable to LIKELY_FREE"
  );
}

// --- Scenario 5: vote stuffing — same user voting 3x doesn't count -
{
  const votes: CancellationVote[] = [
    { roomId: "MAIN-G-01", votedAt: mondayInClass, userId: "u1", verifiedNearRoom: true },
    { roomId: "MAIN-G-01", votedAt: mondayInClass, userId: "u1", verifiedNearRoom: true },
    { roomId: "MAIN-G-01", votedAt: mondayInClass, userId: "u1", verifiedNearRoom: true },
  ];
  const status = getRoomStatus("MAIN-G-01", mondayInClass, timetable, votes, []);
  assert(
    status.state === "OCCUPIED",
    "Scenario 5: same user voting 3x is deduped -> still OCCUPIED (anti-abuse works)"
  );
}

// --- Scenario 6: unverified votes (not near room) don't count ------
{
  const votes: CancellationVote[] = [
    { roomId: "MAIN-G-01", votedAt: mondayInClass, userId: "u1", verifiedNearRoom: false },
    { roomId: "MAIN-G-01", votedAt: mondayInClass, userId: "u2", verifiedNearRoom: false },
    { roomId: "MAIN-G-01", votedAt: mondayInClass, userId: "u3", verifiedNearRoom: false },
  ];
  const status = getRoomStatus("MAIN-G-01", mondayInClass, timetable, votes, []);
  assert(
    status.state === "OCCUPIED",
    "Scenario 6: unverified votes ignored -> still OCCUPIED (someone can't fake it from off-campus)"
  );
}

// --- Scenario 7: AVAILABLE room with a fresh occupancy report ------
{
  const reports: OccupancyReport[] = [
    {
      roomId: "MAIN-G-03",
      reportedAt: mondayInClass,
      userId: "u1",
      occupancyPercent: 40,
      source: "manual",
      verifiedNearRoom: true,
    },
  ];
  const status = getRoomStatus("MAIN-G-03", mondayInClass, timetable, [], reports);
  assert(
    status.state === "AVAILABLE" && (status as any).occupancyPercent === 40,
    "Scenario 7: AVAILABLE room shows the latest occupancy report (40%)"
  );
}

// --- Scenario 8: occupancy formula (corrected, no +20) --------------
{
  const pct = calculateOccupancyPercent(30, 60);
  assert(pct === 50, "Scenario 8: 30 people / 60 seats = 50% (not using +20)");
  const capped = calculateOccupancyPercent(90, 60);
  assert(capped === 100, "Scenario 8b: over-capacity count is capped at 100%, not >100%");
}

console.log("\nAll scenarios run. See ❌ above for any failures.");
