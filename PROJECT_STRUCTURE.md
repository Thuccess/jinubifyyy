# Jinubify MERN Full-Stack Project Structure

## Overview

This is a complete MERN (MongoDB, Express, React, Node.js) full-stack application with separate frontend and backend folders.

## Project Structure

```
jinubify/
├── frontend/                 # React frontend application
│   ├── components/           # React components
│   │   ├── pages/           # Page components
│   │   ├── layout/          # Layout components
│   │   ├── data/            # Static data files
│   │   └── ...
│   ├── public/              # Static assets
│   ├── App.tsx              # Main app component
│   ├── index.tsx            # Entry point
│   ├── package.json         # Frontend dependencies
│   └── vite.config.ts       # Vite configuration
│
└── backend/                 # Express.js backend API
    ├── models/              # MongoDB models
    │   ├── User.js
    │   ├── BlogPost.js
    │   ├── Contact.js
    │   ├── Order.js
    │   └── Activity.js
    ├── routes/              # API routes
    │   ├── auth.js          # Authentication routes
    │   ├── users.js         # User routes
    │   ├── blog.js          # Blog routes
    │   ├── contact.js       # Contact form routes
    │   └── dashboard.js     # Dashboard routes
    ├── middleware/          # Express middleware
    │   └── auth.js          # Authentication middleware
    ├── scripts/             # Utility scripts
    │   └── seedBlogPosts.js # Seed blog posts
    ├── server.js            # Express server entry point
    ├── package.json         # Backend dependencies
    ├── env.example          # Environment variables template
    └── README.md            # Backend documentation
```

## Frontend (React)

### Technology Stack
- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **React Router** - Routing
- **Tailwind CSS** - Styling (via classes)

### Key Features
- Multi-page website with routing
- Dark/Light theme toggle
- User authentication UI
- Blog system with search
- Contact form
- User dashboard
- Responsive design

### Pages
- Home (`/`)
- About (`/about`)
- Services (`/services`)
- Portfolio (`/portfolio`)
- Blog (`/blog`)
- Blog Post (`/blog/:slug`)
- Contact (`/contact`)
- Team (`/team`)
- Dashboard (`/dashboard`) - Protected route
- Terms of Service (`/terms-of-service`)
- Privacy Policy (`/privacy-policy`)

## Backend (Express.js)

### Technology Stack
- **Node.js** - Runtime
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing

### API Endpoints

#### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

#### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

#### Blog
- `GET /api/blog` - Get all blog posts
- `GET /api/blog/:slug` - Get single blog post
- `POST /api/blog` - Create blog post (admin)
- `PUT /api/blog/:slug` - Update blog post (admin)
- `DELETE /api/blog/:slug` - Delete blog post (admin)

#### Contact
- `POST /api/contact` - Submit contact form
- `GET /api/contact` - Get all submissions (admin)

#### Dashboard
- `GET /api/dashboard/overview` - Get dashboard stats
- `GET /api/dashboard/orders` - Get user orders
- `GET /api/dashboard/activities` - Get user activities
- `POST /api/dashboard/orders` - Create new order

## Database Models

### User
- Authentication and profile information
- Balance tracking
- Role-based access (user/admin)

### BlogPost
- Blog content management
- SEO-friendly slugs
- View tracking

### Contact
- Contact form submissions
- Status tracking

### Order
- User orders
- Service tracking
- Status management

### Activity
- User activity log
- Dashboard feed

## Getting Started

### Backend Setup

1. Navigate to backend folder:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file from `env.example`:
   ```bash
   cp env.example .env
   ```

4. Configure `.env` with your MongoDB URI and JWT secret

5. Start MongoDB (local or Atlas)

6. Run the server:
   ```bash
   npm run dev
   ```

7. (Optional) Seed blog posts:
   ```bash
   node scripts/seedBlogPosts.js
   ```

### Frontend Setup

1. Navigate to frontend folder:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

## Environment Variables

### Backend (.env)
- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `JWT_EXPIRES_IN` - Token expiration (default: 7d)
- `FRONTEND_URL` - Frontend URL for CORS
- `SMTP_*` - Email configuration (optional)

## Next Steps

1. **Connect Frontend to Backend**:
   - Update frontend API calls to use backend endpoints
   - Add axios or fetch for API requests
   - Implement authentication flow with JWT tokens

2. **Environment Configuration**:
   - Set up MongoDB (local or Atlas)
   - Configure environment variables
   - Set up email service (optional)

3. **Deployment**:
   - Deploy backend to services like Heroku, Railway, or Render
   - Deploy frontend to Vercel, Netlify, or similar
   - Configure CORS and environment variables

## Development Tips

- Backend runs on `http://localhost:5000`
- Frontend runs on `http://localhost:5173` (Vite default)
- Use Postman or Thunder Client to test API endpoints
- Check browser console and network tab for API calls
- MongoDB Compass is helpful for database management

