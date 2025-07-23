# mental-health-webapp

# Health App Frontend

This is the frontend for the Health App, built with React, Vite, and Tailwind CSS. It provides a modern, responsive UI for users to access mental health resources, chat with an AI (Gemini), book therapists, track therapy, manage schedules, and more.

## Features
- Responsive design for desktop and mobile
- Resource management (songs, podcasts, ebooks, videos)
- Real-time resource sync between devices
- AI chat powered by Gemini API
- Therapist booking and dashboard
- Therapy tracker, daily check-ins, and goals
- Fast signup/login with JWT authentication
- Cloudinary integration for file uploads
- Vercel-ready deployment


## Development
```
cd frontend
npm install
npm run dev
```

## Deployment
Deploy to Vercel. Set `VITE_API_URL` in Vercel dashboard to your Render backend URL.

## API
All API requests are proxied to the backend using the `VITE_API_URL` variable.

---
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
MONGO_URI=mongodb-atlas-uri
PORT=5001
GEMINI_API_KEY=gemini-api-key
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
FRONTEND_URL=
JWT_SECRET=
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

#Joe21-dev




