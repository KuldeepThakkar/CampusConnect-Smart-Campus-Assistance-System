/**
 * room-status-engine.ts
 * ---------------------------------------------------------
 * Decides what status to show a user for any given room, at
 * any given moment. This is the "hybrid" algorithm we agreed
 * on after comparing two approaches:
 *
 *   1. (Claude's original) timetable + manual occupancy slider
 *   2. (Your idea) timetable + photo/CV occupancy + override vote
 *
 * What we kept from each:
 *   - Timetable stays the baseline source of truth (both agreed).
 *   - Manual occupancy % ships now; photo/CV people-counting is
 *     DEFERRED to Phase 2 — it's a real computer-vision project on
 *     its own and shouldn't block the MVP. The hook for it is left
 *     in place (see `OccupancyReport.source`) so swapping it in
 *     later doesn't require restructuring this file.
 *   - The "lecture got cancelled" gap you found is solved with an
 *     explicit override-vote mechanism (point 2 below) — this did
 *     NOT exist in either original proposal and was added because
 *     you correctly identified the gap.
 *
 * THE ALGORITHM (in order, first match wins):
 *   1. No timetable entry covers this room right now -> AVAILABLE
 *   2. Timetable entry exists, but a cancellation override has
 *      reached quorum -> LIKELY_FREE (still shown as "unconfirmed"
 *      in the UI so people don't fully trust it blindly)
 *   3. Timetable entry exists, no override quorum -> OCCUPIED
 *   4. If status resolves to AVAILABLE, attach the latest
 *      crowdsourced occupancy %, if any, so the UI can show
 *      "Available, ~40% full" instead of just a bare AVAILABLE.
 * ---------------------------------------------------------
 */

import { getRoomById } from "./campus-structure";

// ---- Types -----------------------------------------------------

export interface TimetableEntry {
  entryId: string;
  roomId: string;
  subject: string;
  facultyName: string;
  dayOfWeek: number; // 0=Sun ... 6=Sat
  startTime: string; // "HH:MM"
  endTime: string;   // "HH:MM"
  semester: number;
  batch: string;
}

/** A single user's vote that a timetabled class is NOT actually happening. */
export interface CancellationVote {
  roomId: string;
  votedAt: Date;
  userId: string;
  /**
   * Anti-abuse requirement (from the comparison table): a vote only
   * counts if the user is verifiably near the room. Reuses the same
   * QR-checkpoint idea planned for navigation — one mechanism, two
   * features. If this is false, the vote is logged but ignored.
   */
  verifiedNearRoom: boolean;
}

/** A crowdsourced occupancy report for a room that's already AVAILABLE. */
export interface OccupancyReport {
  roomId: string;
  reportedAt: Date;
  userId: string;
  occupancyPercent: number; // 0-100, already capped
  /**
   * Phase 1: "manual" (user-entered slider/preset).
   * Phase 2 (future): "photo_cv" once people-counting is built.
   * Keeping this field now means the engine doesn't change later —
   * only the report-creation code does.
   */
  source: "manual" | "photo_cv";
  verifiedNearRoom: boolean;
}

export type RoomStatus =
  | { state: "OCCUPIED"; reason: string; until: string }
  | { state: "LIKELY_FREE"; reason: string; confidence: "unconfirmed" }
  | { state: "AVAILABLE"; occupancyPercent: number | null; occupancySource: "manual" | "photo_cv" | null };

// ---- Config (tune these without touching the algorithm) --------

/** How many independent verified votes are needed to override the timetable. */
const CANCELLATION_VOTE_QUORUM = 3;

/** Votes older than this don't count toward quorum (minutes). */
const CANCELLATION_VOTE_WINDOW_MINUTES = 15;

/** Occupancy reports older than this are considered stale (minutes). */
const OCCUPANCY_REPORT_FRESHNESS_MINUTES = 20;

// ---- Helpers -----------------------------------------------------

function timeToMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

function findActiveTimetableEntry(
  roomId: string,
  now: Date,
  timetable: TimetableEntry[]
): TimetableEntry | undefined {
  const dayOfWeek = now.getDay();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  return timetable.find((entry) => {
    if (entry.roomId !== roomId) return false;
    if (entry.dayOfWeek !== dayOfWeek) return false;
    const start = timeToMinutes(entry.startTime);
    const end = timeToMinutes(entry.endTime);
    return nowMinutes >= start && nowMinutes < end;
  });
}

function hasCancellationQuorum(
  roomId: string,
  now: Date,
  votes: CancellationVote[]
): boolean {
  const windowStart = new Date(now.getTime() - CANCELLATION_VOTE_WINDOW_MINUTES * 60_000);

  const validVotes = votes.filter(
    (v) =>
      v.roomId === roomId &&
      v.verifiedNearRoom &&
      v.votedAt >= windowStart &&
      v.votedAt <= now
  );

  // dedupe by userId — one person can't stuff the quorum by voting twice
  const uniqueVoters = new Set(validVotes.map((v) => v.userId));
  return uniqueVoters.size >= CANCELLATION_VOTE_QUORUM;
}

function latestOccupancyReport(
  roomId: string,
  now: Date,
  reports: OccupancyReport[]
): OccupancyReport | undefined {
  const freshnessCutoff = new Date(now.getTime() - OCCUPANCY_REPORT_FRESHNESS_MINUTES * 60_000);

  return reports
    .filter((r) => r.roomId === roomId && r.verifiedNearRoom && r.reportedAt >= freshnessCutoff)
    .sort((a, b) => b.reportedAt.getTime() - a.reportedAt.getTime())[0];
}

// ---- Main entry point --------------------------------------------

export function getRoomStatus(
  roomId: string,
  now: Date,
  timetable: TimetableEntry[],
  cancellationVotes: CancellationVote[],
  occupancyReports: OccupancyReport[]
): RoomStatus {
  const room = getRoomById(roomId);
  if (!room) {
    throw new Error(`Unknown roomId "${roomId}" — check config/campus-structure.ts`);
  }

  const activeEntry = findActiveTimetableEntry(roomId, now, timetable);

  // 1. Nothing scheduled -> straightforwardly available
  if (!activeEntry) {
    const latest = latestOccupancyReport(roomId, now, occupancyReports);
    return {
      state: "AVAILABLE",
      occupancyPercent: latest ? latest.occupancyPercent : null,
      occupancySource: latest ? latest.source : null,
    };
  }

  // 2. Something's scheduled — check for a cancellation override
  if (hasCancellationQuorum(roomId, now, cancellationVotes)) {
    return {
      state: "LIKELY_FREE",
      reason: `${activeEntry.subject} was timetabled but ${CANCELLATION_VOTE_QUORUM}+ users reported the room is empty`,
      confidence: "unconfirmed",
    };
  }

  // 3. Trust the timetable
  return {
    state: "OCCUPIED",
    reason: `${activeEntry.subject} (${activeEntry.facultyName})`,
    until: activeEntry.endTime,
  };
}

/**
 * Helper for the occupancy% calculation discussed in chat.
 * NOTE: we corrected the formula you proposed. count(people)/(seats+20)
 * doesn't make sense — a room can't be "occupied" beyond its seat count
 * under normal use. This caps at seats, not seats+20. If you actually
 * intended +20 to account for standing-room/overflow events, tell me
 * and we'll add an `allowOverflow` flag instead of silently changing it.
 */
export function calculateOccupancyPercent(peopleCount: number, seats: number): number {
  if (seats <= 0) throw new Error("seats must be > 0");
  const pct = (peopleCount / seats) * 100;
  return Math.min(100, Math.round(pct));
}
