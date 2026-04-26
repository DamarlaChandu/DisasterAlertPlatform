# Disaster Alert Platform

A full-stack Local Disaster Alert & Resource Coordination Platform designed to streamline emergency response. It connects citizens in distress with local volunteers and authorities for efficient disaster management.

### Key Features
- **Real-Time Disaster Reporting**: Citizens can instantly report incidents with accurate geolocation.
- **Live Tracking & Mapping**: Interactive maps showing active disasters, volunteer locations, and safe zones.
- **Resource Coordination**: Request and manage critical resources like food, medical supplies, and shelter.
- **Role-Based Dashboards**: Dedicated interfaces for Citizens, Volunteers, and Administrators.
- **Instant Notifications**: Real-time alerts and socket-based updates during critical emergencies.
## Prerequisites
- Node.js
- MongoDB

## Installation

### 1. Backend Setup
Navigate to the backend directory, install dependencies, and configure your environment variables.
```bash
cd backend
npm install
```
*Note: Create a `.env` file in the `backend` directory with your required credentials (e.g., `MONGO_URI`, `JWT_SECRET`, `PORT`).*

### 2. Frontend Setup
Navigate to the frontend directory and install dependencies.
```bash
cd frontend
npm install
```

## How to Run

You will need two terminal windows to run both the frontend and backend servers simultaneously.

**Terminal 1: Start the Backend**
```bash
cd backend
npm start
```

**Terminal 2: Start the Frontend**
```bash
cd frontend
npm run dev
```

The frontend will start a local development server (typically on `http://localhost:5173`), and the backend will run on the port specified in your `.env` file.
