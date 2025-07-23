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

## Environment Variables
Create a `.env.production` file for deployment:
```
VITE_API_URL=https://your-backend-url.onrender.com
```

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


