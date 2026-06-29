# DisasterAlertPlatform - Deployment Guide

## Architecture
The backend now serves the frontend as static files on the same domain. This allows single-domain deployment.

## Deployment Options

### Option 1: Render.com (Recommended)
Render supports Node.js and is free tier friendly.

**Steps:**
1. Push code to GitHub (if not already)
2. Go to [render.com](https://render.com)
3. Create new Web Service from GitHub repo
4. Settings:
   - **Build Command:** `cd backend && npm install && npm run build-all`
   - **Start Command:** `npm start`
   - **Root Directory:** `backend`
5. Add Environment Variables:
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: Your JWT secret
   - `NODE_ENV`: production
   - `FRONTEND_URL`: Your Render URL (e.g., https://yourdomain.onrender.com)
6. Deploy

### Option 2: Railway.app
Similar to Render with simple setup.

**Steps:**
1. Connect GitHub repo
2. Add `railway.json` config (if needed)
3. Set environment variables
4. Deploy

### Option 3: Heroku (Legacy)
Still works but paid plans only now.

### Option 4: AWS/Azure
For more control and scalability.

## Local Testing

Before deployment, test locally:

```bash
# Build frontend
cd frontend
npm install
npm run build

# Start backend (serves frontend)
cd ../backend
npm install
npm start
```

Then visit `http://localhost:5000` - you should see your app with both frontend and backend working together.

## Environment Variables Required

```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
NODE_ENV=production
FRONTEND_URL=https://yourdomain.onrender.com
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
```

## Build Process

The updated build script:
- Installs frontend dependencies
- Builds frontend React app into `dist/`
- Backend serves these files automatically
- All API routes work as `/api/*`
- All other routes serve `index.html` for React Router

## Key Changes Made

1. ✅ Backend now serves frontend static files
2. ✅ Frontend API calls use relative URLs (`/api`)
3. ✅ Socket.IO connects to same domain
4. ✅ Build scripts in `package.json`
5. ✅ SPA fallback for React Router

## Deployment Checklist

- [ ] All environment variables set
- [ ] MongoDB URI configured
- [ ] Frontend builds without errors: `npm run build`
- [ ] Backend starts without errors: `npm start`
- [ ] Test API endpoints work
- [ ] Socket.IO connection works
- [ ] Push to main branch
- [ ] Deploy through hosting platform

## Troubleshooting

**Frontend not loading:**
- Check that frontend was built to `../frontend/dist`
- Verify path in server.js is correct

**API not working:**
- Check CORS is correctly configured in server.js
- Verify backend environment variables

**Socket.IO not connecting:**
- Check Socket.IO CORS settings in server.js
- Verify FRONTEND_URL environment variable
