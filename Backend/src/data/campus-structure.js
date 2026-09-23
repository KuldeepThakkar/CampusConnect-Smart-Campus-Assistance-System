// campus-structure.js
// JS port of files/campus-structure.ts — single source of truth for the
// physical room layout. roomId is the foreign key used everywhere.
// When you add real floors, add them here; nothing else needs changing.

const CAMPUS = [
    {
        buildingCode: "MAIN",
        buildingName: "Main Building",
        floors: [
            {
                floorId: "MAIN-G",
                floorLabel: "Ground Floor",
                floorIndex: 0,
                rooms: [
                    { roomId: "MAIN-G-01", roomNumber: "G-01", type: "classroom", seats: 60, hasProjector: true,  hasAC: true  },
                    { roomId: "MAIN-G-02", roomNumber: "G-02", type: "classroom", seats: 60, hasProjector: true,  hasAC: false },
                    { roomId: "MAIN-G-03", roomNumber: "G-03", type: "classroom", seats: 40, hasProjector: false, hasAC: false },
                    { roomId: "MAIN-G-04", roomNumber: "G-04", type: "classroom", seats: 80, hasProjector: true,  hasAC: true  },
                ]
            }
            // Add more floors here — each room needs a unique roomId.
        ]
    }
];

/** Flat array of every room across all buildings and floors. */
function getAllRooms() {
    return CAMPUS.flatMap((b) => b.floors.flatMap((f) => f.rooms));
}

/** Look up a single room by its unique roomId. Returns undefined if not found. */
function getRoomById(roomId) {
    return getAllRooms().find((r) => r.roomId === roomId);
}

module.exports = { CAMPUS, getAllRooms, getRoomById };
