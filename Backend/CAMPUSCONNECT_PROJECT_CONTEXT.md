# CampusConnect Smart Campus Assistance System

## Complete Project Context for Claude

**Repository:** `CampusConnect-Smart-Campus-Assistance-System`

**Purpose:** CampusConnect is a smart-campus assistance backend prototype. The implemented Express application provides campus-map data, a generated checkpoint graph, and classroom navigation from a user's GPS location. The repository also contains a separate TypeScript prototype for room availability and occupancy status. The TypeScript prototype is not currently connected to the Express server.

**Important architectural fact:** Treat the repository as two related but currently independent subsystems:

1. **Running JavaScript/Express subsystem:** campus data, graph generation, nearest checkpoint, classroom lookup, shortest-path navigation, and MongoDB startup connection.
2. **Standalone TypeScript subsystem:** room structure, dummy timetable, room-status rules, occupancy reports, cancellation votes, and manual assertion tests.

---

## 1. Repository Inventory

The project currently contains these relevant files:

```text
package.json
server.js
.gitignore
files/
  campus-structure.ts
  dummy-timetable.json
  room-status-engine.test.ts
  room-status-engine.ts
src/
  app.js
  controllers/
    campus.controller.js
    navigation.controller.js
  data/
    campus-data.json
    timetable.json
  db/
    db.js
  routes/
    campus.routes.js
    navigation.routes.js
  services/
    campus.service.js
    classroom.service.js
    dijkstra.service.js
    graph.service.js
    navigation.service.js
    nearestCheckpoint.service.js
```

`node_modules/` and `.env` are ignored by [`.gitignore`](.gitignore). The package metadata also points to a GitHub repository:
`https://github.com/KuldeepThakkar/CampusConnect-Smart-Campus-Assistance-System.git`

---

## 2. Technology and Setup

### Runtime

- Node.js project using CommonJS modules.
- `package.json` has `"type": "commonjs"`.
- Express version declared: `^5.2.1`.
- Mongoose version declared: `^9.7.4`.
- dotenv version declared: `^17.4.2`.
- Nodemon development dependency: `^3.1.14`.

### Package metadata

- Name: `campusconnect-smart-campus-assistance-system`
- Version: `1.0.0`
- Description is currently empty.
- Main entry is declared as `index.js`, but `index.js` does not exist and is not used. The actual entrypoint is `server.js`.
- Only script currently defined:

```json
{
  "scripts": {
    "dev": "nodemon server.js"
  }
}
```

There are no `start`, `build`, `test`, TypeScript, Jest, or Vitest scripts.

### Install and run

```bash
npm install
npm run dev
```

The server listens on port `3000`.

### Environment variable

The server requires:

```text
MONGODB_URI=<MongoDB connection string>
```

`server.js` loads `.env` through dotenv. The database module calls `mongoose.connect(process.env.MONGODB_URI)`. The current application does not define models or perform database queries, but startup still attempts the connection and exits the process if it fails.

**Security requirement:** Never copy the actual MongoDB URI or credentials into a shared context. If the credential has ever been shared, committed, logged, or backed up, rotate it. Keep `.env` outside generated project summaries.

---

## 3. Runtime Bootstrap and Application Wiring

### `server.js`

Startup sequence:

1. Load environment variables with `require('dotenv').config()`.
2. Import the Express app from `src/app.js`.
3. Call `connectDB()` from `src/db/db.js`.
4. Immediately call `app.listen(3000, ...)` and log that the server is running.

The MongoDB connection promise is not awaited before the HTTP server starts listening. A failed connection eventually logs the error and calls `process.exit(1)`.

### `src/app.js`

The Express app:

- Creates an Express instance.
- Enables JSON request parsing with `express.json()`.
- Mounts campus routes at `/api/campus`.
- Mounts navigation routes at `/api/navigation`.
- Exports the app.

There is currently no authentication, authorization, CORS middleware, request schema validation, rate limiting, structured logger, health endpoint, 404 handler, or centralized error handler.

### Database module

`src/db/db.js` contains only the connection helper. It connects with Mongoose, logs success, logs errors, and exits on failure. There are no Mongoose schemas, models, collections, repositories, or persistence operations in the current source.

---

## 4. HTTP API Contract

### 4.1 Get all campus data

**Request**

```http
GET /api/campus/
```

**Response status:** `200`

**Response shape**

```json
{
  "success": true,
  "data": {
    "checkpoints": [],
    "buildings": [],
    "paths": []
  }
}
```

The arrays are populated from `src/data/campus-data.json`.

### 4.2 Get generated graph

**Request**

```http
GET /api/campus/graph
```

**Response status:** `200`

**Response shape:** the adjacency-list graph object directly, without a `success` wrapper.

Example:

```json
{
  "CP1": [
    { "node": "CP2", "distance": 21 }
  ],
  "CP2": [
    { "node": "CP1", "distance": 21 },
    { "node": "CP3", "distance": 20 }
  ]
}
```

Every path in the JSON data is represented in both directions.

### 4.3 Navigate to a classroom

**Request**

```http
POST /api/navigation/
Content-Type: application/json
```

**Body**

```json
{
  "latitude": 23.0682,
  "longitude": 72.4391,
  "classroom": "LH-10"
}
```

The controller passes `req.body` directly to the navigation service. There is no explicit validation or type checking at the HTTP boundary.

**Success response**

```json
{
  "success": true,
  "path": ["CP1", "CP2", "CP3"],
  "distance": 123
}
```

- `path` is the shortest graph route from the nearest checkpoint to the selected building entrance.
- `distance` is the weighted graph distance, not the Haversine distance from the user to the first checkpoint.

**Failure responses**

```json
{
  "success": false,
  "message": "Classroom not found"
}
```

```json
{
  "success": false,
  "message": "No route found"
}
```

The controller normally sends HTTP `200` even when the service returns one of these failure objects. Lower-level Dijkstra failures can include `Invalid Source Checkpoint` and `Invalid Destination Checkpoint`, although the navigation service generally filters these through its own logic.

### Route source files

- `src/routes/campus.routes.js`: `GET /` and `GET /graph`.
- `src/routes/navigation.routes.js`: `POST /`.
- `src/controllers/campus.controller.js`: returns campus data and graph.
- `src/controllers/navigation.controller.js`: delegates to navigation service and sends the result.

---

## 5. Active Navigation Data Flow

```text
POST /api/navigation/
  -> navigation.controller.navigate
  -> navigation.service.navigate
       -> nearestCheckpoint.service
            -> campus.service
       -> classroom.service
            -> campus.service
       -> dijkstra.service
            -> graph.service
                 -> campus.service
       -> choose shortest route among building entrances
  -> JSON response
```

The campus JSON is read synchronously and parsed when `src/services/campus.service.js` is loaded. The graph is built once at module-load time and remains in memory for the lifetime of the process. Changes to the JSON file require a process restart.

---

## 6. Campus Data Model

`src/data/campus-data.json` has three top-level collections:

```json
{
  "checkpoints": [],
  "buildings": [],
  "paths": []
}
```

### Checkpoints

A checkpoint has this shape:

```json
{
  "id": "CP1",
  "name": "Node-1",
  "type": "Entrance",
  "latitude": 23.068269094258692,
  "longitude": 72.43918329477312
}
```

Observed dataset facts:

- Checkpoint IDs run from `CP1` through `CP173`.
- Types include `Entrance`, `Gate`, `Parking`, and `Canteen`.
- Coordinates are GPS latitude/longitude values around the campus.
- Checkpoints are the vertices in the navigation graph.

### Buildings

A building has this shape:

```json
{
  "id": "B4",
  "name": "Bhanwar Building",
  "entrances": ["CP124", "CP91"],
  "classrooms": ["LH-10", "LH-20", "LH-30", "LH-40"],
  "center": {
    "lat": 23.065044666387983,
    "lng": 72.44023874402048
  },
  "polygon": [
    [23.065419663318426, 72.43999332189561]
  ]
}
```

Observed dataset facts:

- Building IDs run from `B1` through `B15`.
- Some buildings contain no classrooms.
- B4 / Bhanwar Building contains `LH-10`, `LH-20`, `LH-30`, and `LH-40`.
- B5 / Main Building contains `LH-50`, `LH-60`, `LH-70`, and `LH-80`.
- Most other buildings currently have empty classroom arrays.
- `center` is a representative coordinate.
- `polygon` stores building geometry as coordinate pairs.
- `entrances` links buildings to graph checkpoints.

### Paths

A path has this shape:

```json
{
  "id": "P1",
  "from": "CP1",
  "to": "CP2",
  "distance": 21
}
```

Paths are weighted edges. The graph service adds both `from -> to` and `to -> from`, so the active graph is undirected.

---

## 7. Navigation Algorithms

### 7.1 Nearest checkpoint: Haversine distance

`nearestCheckpoint.service.js` compares the user's coordinates with every checkpoint using the Haversine formula.

- Earth radius constant: `6,371,000` meters.
- Latitude and longitude deltas are converted from degrees to radians.
- The service computes great-circle distance to each checkpoint.
- It returns the closest checkpoint ID and geographic distance.

Return shape:

```json
{
  "checkpointId": "CP1",
  "distance": 42.5
}
```

This distance is only used to select the starting graph node. The final navigation response uses graph edge distance instead.

### 7.2 Graph construction

`graph.service.js`:

1. Creates an empty adjacency list for every checkpoint.
2. Iterates through every path.
3. Adds a neighbor object for `from -> to`.
4. Adds a neighbor object for `to -> from`.

Neighbor shape:

```js
{
  node: "CP2",
  distance: 21
}
```

### 7.3 Shortest path: Dijkstra

`dijkstra.service.js`:

1. Validates source and destination keys.
2. Initializes all distances to `Infinity`.
3. Sets the source distance to `0`.
4. Repeatedly scans unvisited nodes to select the smallest current distance.
5. Relaxes each neighboring edge.
6. Records predecessors in `previous`.
7. Reconstructs the path by walking backward from the destination.
8. Returns the node path and total weighted distance.

This is an O(V²)-style implementation because it scans all graph nodes to select the next node. A priority queue would improve scalability for a larger campus graph, but the current implementation is straightforward and suitable for the current prototype size.

### 7.4 Classroom route selection

`navigation.service.js` performs these steps:

1. Extract `latitude`, `longitude`, and `classroom` from the request body.
2. Find the nearest checkpoint to the user's GPS coordinates.
3. Find the first building whose `classrooms` array contains the classroom string.
4. Run Dijkstra from the nearest checkpoint to each entrance in that building's `entrances` array.
5. Ignore unsuccessful route candidates.
6. Select the successful route with the smallest graph distance.
7. Return `{ success: true, path, distance }`.

The response does not include the building ID, building name, classroom name, nearest checkpoint, or the geographic distance from the user to that checkpoint.

### Recognized navigation classrooms

The active campus navigation JSON currently recognizes:

```text
LH-10
LH-20
LH-30
LH-40
LH-50
LH-60
LH-70
LH-80
```

`classroom.service.js` uses an exact string membership check. Case differences, whitespace, aliases, and unknown classroom IDs are not normalized.

---

## 8. Timetable Data

`src/data/timetable.json` contains timetable data but is not imported by the Express application and is not exposed through an endpoint.

Top-level academic context:

- Department: `Engineering`
- Branch: `CE`
- Semester: `5`
- Divisions: `CE-A`, `CE-B`, `CE-C`

Each division has schedules for Monday through Friday. Each day contains six class slots. Each slot includes:

- `startTime`
- `endTime`
- `subject`
- `faculty`
- `classroom`

The timetable uses classroom values `LH-1` through `LH-30`.

### Important data mismatch

There is a mismatch between timetable and navigation data:

- Timetable classroom range: `LH-1` through `LH-30`.
- Navigation classroom IDs: only `LH-10`, `LH-20`, `LH-30`, `LH-40`, `LH-50`, `LH-60`, `LH-70`, `LH-80`.

Therefore, most timetable classrooms cannot currently be routed through `POST /api/navigation/`. Integrating timetable lookup with campus buildings will require a canonical classroom naming scheme and a mapping for every room.

---

## 9. Standalone TypeScript Room-Status Prototype

The files under `files/` are not imported from `src/` and are not run by the Express server.

### 9.1 Physical campus structure

`files/campus-structure.ts` defines:

```ts
type RoomType = "classroom" | "lab" | "office" | "facility";
```

Room records contain:

- `roomId`
- `roomNumber`
- `type`
- `seats`
- `hasProjector`
- `hasAC`

Current dummy configuration:

- Building: `MAIN`.
- Floor: `MAIN-G`.
- Rooms:
  - `MAIN-G-01`: classroom, 60 seats, projector, AC.
  - `MAIN-G-02`: classroom, 60 seats, projector, no AC.
  - `MAIN-G-03`: lab, 40 seats, no projector, no AC.
  - `MAIN-G-04`: classroom, 80 seats, projector, AC.

The file describes future floors and explicitly treats the configuration as dummy data.

Exports/functions:

- `getAllRooms()` returns all configured rooms.
- `getRoomById(roomId)` returns the room matching an ID.

### 9.2 Dummy timetable

`files/dummy-timetable.json` contains four entries:

| Room | Subject | Day | Time |
|---|---|---|---|
| `MAIN-G-01` | Data Structures | Monday | 09:00-10:00 |
| `MAIN-G-02` | Operating Systems | Monday | 09:00-11:00 |
| `MAIN-G-03` | DBMS Lab | Monday | 11:00-13:00 |
| `MAIN-G-04` | Computer Networks | Monday | 14:00-15:00 |

Each entry includes:

- `entryId`
- `roomId`
- `subject`
- `facultyName`
- `dayOfWeek`
- `startTime`
- `endTime`
- `semester`
- `batch`

### 9.3 Room status rules

`files/room-status-engine.ts` supports:

```text
OCCUPIED
LIKELY_FREE
AVAILABLE
```

Configuration:

- Cancellation quorum: `3` unique users.
- Cancellation vote window: `15` minutes.
- Occupancy report freshness: `20` minutes.

Core behavior:

1. If no timetable entry is active for a room, return `AVAILABLE`.
2. A fresh verified occupancy report may be attached to an available room.
3. If an active timetable entry exists and at least three unique verified users voted within the last 15 minutes that the room is empty, return `LIKELY_FREE`.
4. Otherwise, an active scheduled room returns `OCCUPIED`.

Cancellation votes are accepted only when:

- The vote's `roomId` matches the room being evaluated.
- `verifiedNearRoom === true`.
- The timestamp is within the rolling 15-minute window.
- The user has not already voted; duplicate `userId` values are deduplicated.

Occupancy reports are accepted only when:

- The report's `roomId` matches.
- `verifiedNearRoom === true`.
- The report is newer than the 20-minute freshness cutoff.
- The newest matching report is selected.

Supported occupancy sources:

- `manual`
- `photo_cv`

Photo/CV report generation is not implemented in this repository; only the source value is supported by the model/rules.

### Occupancy percentage

`calculateOccupancyPercent(peopleCount, seats)`:

- Throws if `seats <= 0`.
- Calculates `peopleCount / seats * 100`.
- Rounds to the nearest integer.
- Caps the result at `100`.
- Does not reject negative `peopleCount` values, which is a validation gap.

---

## 10. Tests and Verification

The only test file is `files/room-status-engine.test.ts`. It uses manual assertions rather than a configured test framework.

Covered scenarios:

1. Active room returns `OCCUPIED`.
2. Unscheduled room returns `AVAILABLE`.
3. Two cancellation votes do not meet quorum.
4. Three verified unique voters return `LIKELY_FREE`.
5. Duplicate votes from one user do not meet quorum.
6. Unverified votes do not count.
7. Fresh occupancy reports are included for available rooms.
8. Occupancy percentage calculation and 100% capping work.

The test comment suggests:

```bash
npx ts-node test/room-status-engine.test.ts
```

But the actual test is in `files/room-status-engine.test.ts`, not `test/`. Also:

- `ts-node` is not declared.
- TypeScript is not declared.
- No test runner is configured.
- No npm test script exists.
- The test imports TypeScript directly.
- The test contains Unicode checkmark/cross output characters.

The JavaScript navigation backend currently has no automated tests in the repository.

---

## 11. Current Limitations and Risks

### Integration gaps

- The TypeScript room-status engine is disconnected from the Express app.
- `src/data/timetable.json` is disconnected from all services and routes.
- The two data models use incompatible room identifiers (`LH-*` versus `MAIN-G-*`).
- There is no room availability API.
- There is no live occupancy input, photo upload, computer-vision pipeline, or persistence layer.

### API and validation gaps

- Navigation request bodies are not schema-validated.
- Invalid or missing latitude/longitude values are not explicitly rejected.
- Classroom strings are not normalized.
- Failure cases are generally returned with HTTP 200 instead of appropriate 4xx/5xx status codes.
- There is no centralized error handler.
- There is no API documentation or OpenAPI specification.
- There is no authentication or authorization.
- There is no rate limiting or CORS policy.

### Data and algorithm gaps

- Campus data is synchronously loaded at module initialization.
- The graph is static until process restart.
- Dijkstra uses an O(V²)-style node selection loop.
- The route does not include the final building entrance metadata in the response.
- Haversine distance and graph distance use different units/meanings and are not both returned.
- Classroom mappings are incomplete.
- Negative occupancy counts are accepted.

### Infrastructure gaps

- MongoDB is required for startup but currently provides no application value.
- The database connection is not awaited before listening.
- There is no health/readiness endpoint.
- There is no production start script.
- There is no build pipeline, CI configuration, Dockerfile, deployment manifest, or observability setup.
- `package.json` points to a missing `index.js`.

### Secret handling

`.env` is ignored by Git, but credentials existing in a local workspace can still be exposed through sharing, backups, logs, or generated artifacts. Do not put the MongoDB URI into this PDF or any prompt. Rotate credentials if exposure is suspected.

---

## 12. Recommended Next Development Sequence

A sensible implementation sequence for future work is:

1. Decide whether MongoDB is needed now. If not, make database startup optional or remove it until persistence is implemented.
2. Add a real `start` script and a test script.
3. Add TypeScript tooling or convert the room-status prototype to the chosen runtime format.
4. Define one canonical room identifier model and map timetable rooms to building/classroom/entrance data.
5. Integrate timetable lookup into a dedicated availability service.
6. Expose room status through an API endpoint with request and response schemas.
7. Add validation for coordinates, classroom IDs, room IDs, timestamps, vote payloads, and occupancy counts.
8. Add appropriate HTTP status codes and centralized error handling.
9. Add automated tests for campus endpoints, graph construction, nearest checkpoint, Dijkstra, navigation failures, timetable lookup, and room-status edge cases.
10. Add a health endpoint, structured logs, CORS/auth policy as required, and deployment configuration.
11. Document the final API with OpenAPI and include example requests/responses.

---

## 13. Guidance for Claude

When modifying this project:

- Preserve the distinction between the active Express backend and the standalone TypeScript prototype until an explicit integration plan is chosen.
- Read the actual JSON data before assuming room/building relationships.
- Do not expose `.env` contents or credentials.
- Be careful that `src/data/timetable.json` and `src/data/campus-data.json` currently use different classroom naming conventions.
- Treat graph edge distances as route weights and Haversine distance as GPS proximity; they are not interchangeable.
- Keep route selection deterministic when multiple building entrances exist.
- Add tests before changing navigation or room-status rules.
- Prefer small, explicit services consistent with the current CommonJS structure unless the project is intentionally migrated to TypeScript.

This document is a generated repository context snapshot. It should be refreshed after major changes to routes, data schemas, dependencies, or the room-status integration.
