/**
 * campus-structure.ts
 * ---------------------------------------------------------
 * SINGLE SOURCE OF TRUTH for the physical campus layout.
 *
 * HOW TO EXTEND THIS LATER (read before editing):
 *   - Right now we only have GROUND FLOOR of one building, 4 rooms.
 *   - When you're ready to add more floors, just add another
 *     entry to the `floors` array below. Nothing else in the
 *     codebase needs to change — room status logic, the map,
 *     and the timetable importer all read from this file.
 *   - Per your plan: Ground + 1st floor = 6 classrooms each,
 *     floors 2-4 = whatever count you confirm later.
 *   - `roomId` MUST be globally unique across the whole campus
 *     (used as the foreign key everywhere). Suggested pattern:
 *     "<buildingCode>-<floor>-<roomNumber>", e.g. "MAIN-G-04".
 * ---------------------------------------------------------
 */

export type RoomType = "classroom" | "lab" | "office" | "facility";

export interface RoomConfig {
  roomId: string;          // unique, e.g. "MAIN-G-01"
  roomNumber: string;      // human label, e.g. "G-01"
  type: RoomType;
  seats: number;           // used as the denominator for occupancy %
  hasProjector: boolean;
  hasAC: boolean;
}

export interface FloorConfig {
  floorId: string;         // e.g. "MAIN-G"
  floorLabel: string;      // e.g. "Ground Floor"
  floorIndex: number;      // 0 = ground, 1 = first, etc. (used for nav/elevation)
  rooms: RoomConfig[];
}

export interface BuildingConfig {
  buildingCode: string;    // e.g. "MAIN"
  buildingName: string;
  floors: FloorConfig[];
}

/**
 * CURRENT STATE: 1 building, 1 floor (Ground), 4 dummy classrooms.
 *
 * TODO (you): when the real department timetable arrives, the room
 * IDs/numbers/seat-counts here should match exactly what's in that
 * timetable, or the importer in data/dummy-timetable.json will not
 * line up. Easiest path: rename these 4 rooms to match your actual
 * room numbers, THEN swap the dummy timetable for the real one.
 */
export const CAMPUS: BuildingConfig[] = [
  {
    buildingCode: "MAIN",
    buildingName: "Main Building",
    floors: [
      {
        floorId: "MAIN-G",
        floorLabel: "Ground Floor",
        floorIndex: 0,
        rooms: [
          { roomId: "MAIN-G-01", roomNumber: "G-01", type: "classroom", seats: 60, hasProjector: true, hasAC: true },
          { roomId: "MAIN-G-02", roomNumber: "G-02", type: "classroom", seats: 60, hasProjector: true, hasAC: false },
          { roomId: "MAIN-G-03", roomNumber: "G-03", type: "classroom", seats: 40, hasProjector: false, hasAC: false },
          { roomId: "MAIN-G-04", roomNumber: "G-04", type: "classroom", seats: 80, hasProjector: true, hasAC: true },
        ],
      },

      // --- FUTURE FLOORS GO HERE -----------------------------------
      // When you're ready, uncomment/copy this pattern. Ground + 1st
      // floor = 6 rooms each per your note; floors above that, fill
      // in once confirmed. Nothing else needs to change.
      //
      // {
      //   floorId: "MAIN-1",
      //   floorLabel: "1st Floor",
      //   floorIndex: 1,
      //   rooms: [
      //     { roomId: "MAIN-1-01", roomNumber: "1-01", type: "classroom", seats: 60, hasProjector: true, hasAC: true },
      //     // ...6 rooms total
      //   ],
      // },
      // ---------------------------------------------------------------
    ],
  },
];

/** Flat lookup helper — every other file should use this instead of
 * walking the nested CAMPUS structure by hand. */
export function getAllRooms(): RoomConfig[] {
  return CAMPUS.flatMap((b) => b.floors.flatMap((f) => f.rooms));
}

export function getRoomById(roomId: string): RoomConfig | undefined {
  return getAllRooms().find((r) => r.roomId === roomId);
}
