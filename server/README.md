# Health App Backend

This is the backend for the Health App, built with Node.js, Express, and MongoDB (Atlas). It provides RESTful APIs for resources, authentication, therapists, schedules, goals, check-ins, and more. File uploads are stored in Cloudinary.

## Features
- RESTful API for all app features
- JWT authentication (integrated auth routes)
- MongoDB Atlas for data storage
- Cloudinary for file uploads
- Resource management (CRUD)
- Gemini API chat proxy
- Therapist booking and approval
- Scheduler, check-ins, goals, therapy tracker
- CORS configured for frontend integration
- Render-ready deployment

## Environment Variables
Create a `.env` file:
```
MONGO_URI=your-mongodb-atlas-uri
PORT=5001
GEMINI_API_KEY=your-gemini-api-key
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
FRONTEND_URL=https://your-frontend-url.vercel.app
JWT_SECRET=your-jwt-secret
```

## Development
```
cd server
npm install
npm start
```

## Deployment
Deploy to Render. Set all environment variables in the Render dashboard.

## API Endpoints
- `/api/auth` - Signup/Login
- `/api/resources` - Resource CRUD & upload
- `/api/gemini-chat` - AI chat
- `/api/therapists` - Therapists
- `/api/schedules` - Scheduler
- `/api/checkins` - Daily check-ins
- `/api/goals` - Goals
- `/api/therapy-tracker` - Therapy tracker

---
