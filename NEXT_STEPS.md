# Next Steps Guide

## Step 1: Set Up Backend (Do This First!)

### 1.1 Install Backend Dependencies
```bash
cd backend
npm install
```

### 1.2 Configure Environment Variables
```bash
# Copy the example file
cp env.example .env

# Edit .env and add:
# - MONGODB_URI (your MongoDB connection string)
# - JWT_SECRET (a random secret string)
# - FRONTEND_URL (http://localhost:3000 or your frontend port)
```

**MongoDB Options:**
- **Local MongoDB**: Install MongoDB locally and use `mongodb://localhost:27017/jinubify`
- **MongoDB Atlas** (Cloud): Create free account at https://www.mongodb.com/cloud/atlas and get connection string

### 1.3 Start MongoDB
- **Local**: Make sure MongoDB service is running
- **Atlas**: No setup needed, just use the connection string

### 1.4 Start Backend Server
```bash
npm run dev
```

You should see:
```
✅ Connected to MongoDB
🚀 Server running on port 5000
```

### 1.5 (Optional) Seed Blog Posts
```bash
node scripts/seedBlogPosts.js
```

### 1.6 Test Backend
Open browser: http://localhost:5000/api/health
Should return: `{"status":"OK","message":"Server is running"}`

---

## Step 2: Connect Frontend to Backend

The frontend currently uses static data. You need to:

### 2.1 Create API Service File
Create `frontend/services/api.ts` to handle all API calls

### 2.2 Update Components to Use API
- **Authentication**: Connect signup/login to backend
- **Blog**: Fetch posts from `/api/blog` instead of static data
- **Contact**: Submit to `/api/contact` instead of mailto
- **Dashboard**: Fetch data from `/api/dashboard`
- **User Profile**: Update via `/api/users/profile`

### 2.3 Add JWT Token Management
- Store JWT token after login
- Include token in API requests
- Handle token expiration

---

## Step 3: Quick Test Checklist

- [ ] Backend server running on port 5000
- [ ] MongoDB connected
- [ ] Health check endpoint works
- [ ] Can create a user account
- [ ] Can login and get JWT token
- [ ] Frontend can fetch blog posts
- [ ] Contact form submits to backend

---

## What Would You Like Me To Do?

I can help you with:

1. **Create API service file** - Set up axios/fetch wrapper for API calls
2. **Connect authentication** - Update login/signup to use backend
3. **Connect blog** - Fetch posts from backend API
4. **Connect contact form** - Submit to backend
5. **Connect dashboard** - Fetch real data from backend
6. **Add environment config** - Set up frontend .env for API URL

**Just tell me which one you'd like to start with!**

