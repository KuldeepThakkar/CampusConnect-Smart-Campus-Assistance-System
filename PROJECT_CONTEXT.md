# CampusConnect — Simple Team Context

## 1. Project Goal
CampusConnect is a smart campus assistance app for students.
It helps users:
- choose their academic details
- get their next class information
- find the best route from their current location to the classroom

## 2. What the App Does
The app has 3 main steps:
1. Home page
   - Welcome screen
   - User starts the journey from here

2. Selection page
   - User selects department, branch, semester, and division
   - These values are saved locally in the browser

3. Navigation page
   - App gets the user location
   - Finds the next lecture from timetable data
   - Calculates and shows the route on the map

## 3. Project Structure
### Frontend
Location: Frontend/

Main files:
- src/pages/Home.jsx → landing page
- src/pages/Selection.jsx → academic selection form
- src/pages/Navigation.jsx → main navigation page
- src/components/CampusMap.jsx → map display
- src/services/navigation.js → calls the backend navigation API
- src/api/axios.js → backend API base URL

### Backend
Location: Backend/

Main files:
- server.js → starts the backend server
- src/app.js → sets up Express app and routes
- src/routes/ → API route definitions
- src/controllers/ → request handlers
- src/services/ → business logic for navigation and timetable
- src/data/ → campus and timetable JSON data

## 4. Main User Flow
1. User opens the app
2. User selects academic details
3. Frontend sends the request to the backend
4. Backend finds the next lecture
5. Backend calculates the route to the classroom
6. Frontend shows the route on the map

## 5. Main APIs
### Campus APIs
- GET /api/campus/ → get campus data
- GET /api/campus/graph → get campus graph data

### Navigation APIs
- POST /api/navigation/next-class → find next lecture and route

### Timetable APIs
- GET /api/timetable/options → get academic options

## 6. Important Data Sources
- Backend/src/data/campus-data.json
  - contains checkpoints, buildings, and paths
- Backend/src/data/timetable.json
  - contains class timetable information

## 7. Tech Stack
### Frontend
- React
- Vite
- React Router
- Axios
- Leaflet

### Backend
- Node.js
- Express
- CORS
- dotenv
- Mongoose

## 8. How to Run the Project
### Backend
```bash
cd Backend
npm install
npm run dev
```

### Frontend
```bash
cd Frontend
npm install
npm run dev
```

## 9. Important Notes for the Team
- Frontend and backend must be running together
- Frontend connects to the backend at: http://localhost:3000/api
- This is a prototype project, so some parts may still be basic or incomplete
- Map navigation depends on the campus data JSON files
- Timetable data and campus data must stay consistent

## 10. Best Way to Understand the Project
If you are new to the project, read in this order:
1. Frontend pages in src/pages/
2. Backend routes in src/routes/
3. Backend services in src/services/
4. Data files in src/data/

## 11. Simple Team Summary
This project is a student navigation app that combines:
- academic timetable data
- campus map data
- real-time location-based routing

Its main purpose is to help students reach their next class quickly and easily.
