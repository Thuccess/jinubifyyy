# Jinubify Backend API

A RESTful API backend for the Jinubify MERN full-stack application built with Express.js, MongoDB, and JWT authentication.

## Features

- 🔐 **User Authentication**: Signup, login, and JWT-based authentication
- 👤 **User Management**: Profile management and user data
- 📝 **Blog System**: CRUD operations for blog posts
- 📧 **Contact Form**: Submit and manage contact form submissions
- 📊 **Dashboard**: User dashboard with orders, activities, and statistics
- 🔒 **Protected Routes**: Middleware for authentication and authorization
- 📦 **MongoDB Integration**: Mongoose ODM for database operations

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **express-validator** - Input validation
- **nodemailer** - Email functionality (optional)

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

## Installation

1. **Clone the repository** (if not already done)
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and configure:
   - `MONGODB_URI` - Your MongoDB connection string
   - `JWT_SECRET` - A secret key for JWT tokens (use a strong random string)
   - `FRONTEND_URL` - Your frontend URL (default: http://localhost:3000)
   - Email settings (optional, for contact form)

### Database connection

The backend connects to MongoDB using `MONGODB_URI` from `.env` (required; see `env.example`).

- **Load order**: In `server.js`, `dotenv.config()` runs first, then `validateEnv()` (which requires `MONGODB_URI`), then `connectDB()`.
- **Behavior**: Connection retries up to 5 times with a 5-second delay; the process exits if all retries fail.
- **Health**: `GET /api/health` returns `database: 'connected'` or `'disconnected'` (from Mongoose connection state).
- **Scripts**: `scripts/createAdmin.js` and `scripts/seedDemos.js` use the same env; `seedDemos.js` accepts either `MONGODB_URI` or `MONGO_URI`.
- **Atlas**: If using MongoDB Atlas, ensure your current IP is allowed in Network Access and the URI in `.env` is correct. Do not commit `.env`.

4. **Start MongoDB**
   - Local: Make sure MongoDB is running on your machine
   - Atlas: Your connection string should be in `.env`

5. **Run the server**
   ```bash
   # Development mode (with nodemon)
   npm run dev
   
   # Production mode
   npm start
   ```

6. **Seed initial blog posts** (optional)
   ```bash
   node scripts/seedBlogPosts.js
   ```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Users
- `GET /api/users/profile` - Get user profile (protected)
- `PUT /api/users/profile` - Update user profile (protected)

### Blog
- `GET /api/blog` - Get all blog posts (public)
- `GET /api/blog/:slug` - Get single blog post (public)
- `POST /api/blog` - Create blog post (admin only)
- `PUT /api/blog/:slug` - Update blog post (admin only)
- `DELETE /api/blog/:slug` - Delete blog post (admin only)

### Contact
- `POST /api/contact` - Submit contact form (public)
- `GET /api/contact` - Get all submissions (admin only)

### Dashboard
- `GET /api/dashboard/overview` - Get dashboard stats (protected)
- `GET /api/dashboard/orders` - Get user orders (protected)
- `GET /api/dashboard/activities` - Get user activities (protected)
- `POST /api/dashboard/orders` - Create new order (protected)

## Authentication

Most endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Example API Calls

### Signup
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Get Profile (with token)
```bash
curl -X GET http://localhost:5000/api/users/profile \
  -H "Authorization: Bearer <your-token>"
```

## Database Models

### User
- name, email, password (hashed), photoURL, balance, role, timestamps

### BlogPost
- slug, title, excerpt, content, imageUrl, author, category, date, published, views, timestamps

### Contact
- name, email, subject, message, status, createdAt

### Order
- userId, serviceName, quantity, price, status, completedAt, createdAt

### Activity
- userId, type, description, metadata, createdAt

## Environment Variables

See `.env.example` for all available environment variables.

## Development

- The server runs on `http://localhost:5000` by default
- Use `npm run dev` for development with auto-reload
- API health check: `GET /api/health`

### Direct admin access (no login)

When `NODE_ENV` is not `production`, the admin API allows unauthenticated access so you can open the admin dashboard at `http://localhost:3000/admin` without logging in. To require login even in development, set `ALLOW_ANONYMOUS_ADMIN=false` in `.env`. This bypass is never active in production.

## Production Deployment

1. Set `NODE_ENV=production` in `.env`
2. Use a strong `JWT_SECRET`
3. Configure proper CORS origins
4. Set up MongoDB Atlas or production MongoDB instance
5. Configure email settings if using contact form
6. Use a process manager like PM2

## License

ISC

