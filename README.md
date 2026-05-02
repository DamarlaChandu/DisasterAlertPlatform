# Disaster Alert Platform

## Overview
Disaster Alert Platform is a full-stack MERN disaster management and resource coordination platform designed to streamline emergency response. It connects citizens in distress with local volunteers and authorities through a centralized digital platform.

The system provides separate modules for:
- Citizens
- Volunteers
- Administrators

The platform helps users efficiently manage disaster reporting, resource coordination, real-time tracking, and provides AI-powered assistance during critical emergencies.

## Tech Stack
### Frontend
- React.js (Vite)
- JavaScript
- HTML5
- CSS3
- Axios
- Socket.io-client
- React Router DOM
- Tailwind CSS

### Backend
- Node.js
- Express.js
- Socket.io

### Database
- MongoDB
- Mongoose

### Authentication & Security
- JWT Authentication
- bcrypt Password Hashing

### Integrations
- Google Gemini API (AI Assistant)

## Project Structure
```text
DISASTERALERTPLATFORM
│
├── backend
│   ├── config
│   ├── controllers
│   ├── middleware
│   ├── models
│   ├── routes
│   ├── server.js
│   └── package.json
│
├── frontend
│   ├── public
│   ├── src
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

## Features
### Citizen Module
- User Registration & Login
- Real-Time Disaster Reporting (with accurate geolocation)
- Request Critical Resources (food, medical supplies, shelter)
- AI-Powered Health & Agriculture Assistant
- Live Tracking & Mapping of safe zones

### Volunteer Module
- View Active Disasters & Distress Calls
- Resource Coordination & Management
- Update Incident Status
- Live Tracking & Mapping of volunteer locations

### Admin Module
- User Management (Citizens & Volunteers)
- Role-Based Access Control
- Disaster & Resource Monitoring
- System Dashboard

### Core System Features
- Real-time Socket-based Instant Notifications
- Interactive Maps

## Installation & Setup

### Prerequisites
Install the following software before running the project:
- Node.js (v16 or above)
- MongoDB
- npm

### Clone Repository
```bash
git clone https://github.com/yourusername/DisasterAlertPlatform.git
```
Move into project folder:
```bash
cd DisasterAlertPlatform
```

### Backend Setup
Move into backend folder:
```bash
cd backend
```
Install backend dependencies:
```bash
npm install
```

### Create .env File
Inside the `backend` folder create a file named:
`.env`

Add the following environment variables:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/disaster_alert
JWT_SECRET=your_secret_key
GEMINI_API_KEY=your_google_gemini_api_key
```
*Example using MongoDB Atlas:*
```env
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_secret_key
GEMINI_API_KEY=your_google_gemini_api_key
```

### Start Backend Server
```bash
npm start
```
Backend server will run on:
`http://localhost:5000`

### Frontend Setup
Open a new terminal and move into the frontend folder:
```bash
cd frontend
```
Install frontend dependencies:
```bash
npm install
```

### Start Frontend Server
```bash
npm run dev
```
Frontend application will typically run on:
`http://localhost:5173`

### Installing Node Modules
The `node_modules` folders are not included in GitHub because they are ignored using `.gitignore`.

After cloning the repository, install dependencies manually using:

**Backend**
```bash
cd backend
npm install
```

**Frontend**
```bash
cd frontend
npm install
```
This command will automatically install all required packages from `package.json`.

## API Structure
The backend follows RESTful API architecture.

### Main API Modules
- Authentication APIs
- Disaster Reporting APIs
- Resource Management APIs
- User & Volunteer APIs
- Notification APIs
- AI Assistant (Gemini) APIs

## MVC Architecture
Disaster Alert Platform follows the MVC (Model View Controller) architecture.

### Model
Handles MongoDB schemas and database operations.

### View
Frontend React.js components and UI.

### Controller
Handles business logic and API processing.

## Database
MongoDB is used as the primary database.

Collections include:
- Users
- Disasters/Incidents
- Resources
- Notifications

## CODE EXPLANATION VIDEO
https://drive.google.com/drive/folders/15zguGo4ClItRKnryqoj8dgLBImoUyIPl?usp=sharing

## PROJECT OVERVIEW VIDEO
https://drive.google.com/file/d/1aWkDPIJUX70wiPsGSOf3pSEk2GrD53Jh/view?usp=drive_link

## Future Enhancements
- Offline Support for critical areas
- Advanced AI-based predictive disaster modeling
- Mobile Application
- Integration with local Emergency Services (Police, Fire, Medical)
- SMS alerts for areas without internet access

## Author
Damarla Chandu

## License
This project is developed for educational and academic purposes.
