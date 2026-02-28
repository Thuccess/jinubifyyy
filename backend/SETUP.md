# Backend Setup Guide

## ✅ Completed Steps

1. **Secure JWT Secret Generated**
   - A 128-character cryptographically secure JWT secret has been generated
   - Update your `.env` file with: `JWT_SECRET=b9ecbb3c24352ab1d71a44441662a4cea68fdc5c7606176595e74b9b3f4bb628cc2a38cca1231901980d0e158372429c1eb118bdce09ba07a26e2a9af68f8d54`

## 📧 SMTP Configuration (Optional)

To enable email notifications from the contact form, configure Gmail SMTP:

### Step 1: Enable 2-Factor Authentication
1. Go to your Google Account settings
2. Enable 2-Factor Authentication

### Step 2: Generate App Password
1. Go to: https://myaccount.google.com/apppasswords
2. Select "Mail" and "Other (Custom name)"
3. Enter "Jinubify Contact Form"
4. Click "Generate"
5. Copy the 16-character password

### Step 3: Update .env File
```env
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-character-app-password
CONTACT_EMAIL=jinubify1@gmail.com
```

**Note:** If you don't configure SMTP, the contact form will still save submissions to the database, but no email will be sent.

## 🗄️ MongoDB Connection

Your MongoDB Atlas connection string is configured. If connection fails:

1. **Check MongoDB Atlas:**
   - Log into MongoDB Atlas dashboard
   - Verify your cluster is running (not paused)
   - Check Network Access - ensure your IP is whitelisted (or use 0.0.0.0/0 for development)

2. **Verify Connection String:**
   - The connection string in `.env` should work
   - If issues persist, get a fresh connection string from Atlas

## 🚀 Starting the Server

### Development Mode (with auto-reload):
```bash
cd backend
npm run dev
```

### Production Mode:
```bash
cd backend
npm start
```

### What to Expect:
- ✅ Environment variables validated
- ✅ MongoDB connection (with retry logic - up to 5 attempts)
- ✅ Server running on port 5000
- ✅ Health check available at: http://localhost:5000/api/health
- ✅ API docs available at: http://localhost:5000/api-docs

## 🔍 Testing the Setup

### 1. Health Check
```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2026-01-26T...",
  "uptime": 123.45,
  "database": "connected",
  "environment": "development"
}
```

### 2. Test Authentication
```bash
# Signup
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "Test123!@#"
  }'
```

### 3. View API Documentation
Open in browser: http://localhost:5000/api-docs

## 🔒 Security Features Enabled

- ✅ Helmet.js security headers
- ✅ Rate limiting on all routes
- ✅ MongoDB injection protection
- ✅ Input sanitization
- ✅ Strong password requirements (8+ chars, uppercase, lowercase, number, special char)
- ✅ Secure JWT secret
- ✅ CORS configured

## 📝 Environment Variables Summary

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` | ✅ Yes | MongoDB connection string |
| `JWT_SECRET` | ✅ Yes | Secret for JWT tokens (min 32 chars) |
| `PORT` | ❌ No | Server port (default: 5000) |
| `NODE_ENV` | ❌ No | Environment (development/production) |
| `FRONTEND_URL` | ❌ No | Frontend URL for CORS (default: http://localhost:3000) |
| `SMTP_USER` | ❌ No | Gmail address for email notifications |
| `SMTP_PASS` | ❌ No | Gmail app password |
| `CONTACT_EMAIL` | ❌ No | Email to receive contact form submissions |

## 🐛 Troubleshooting

### MongoDB Connection Issues
- Check if cluster is paused in Atlas
- Verify IP whitelist in Atlas Network Access
- Test connection string format
- Check internet connectivity

### Port Already in Use
```bash
# Find process using port 5000
lsof -i :5000
# Kill the process
kill -9 <PID>
```

### Module Not Found Errors
```bash
cd backend
npm install
```

## 📚 Seeding data

Run the blog seed once after the database is connected so the six default blog posts exist in the DB and are fully editable from the admin dashboard (Blog Posts at `/admin/blog`):

```bash
node scripts/seedBlogPosts.js
```

The script only inserts posts whose slug does not already exist, so it is safe to run again. Do not remove this step if you want existing blog content to be controllable by admin.

## 📚 Next Steps

1. Start the server and verify it connects to MongoDB
2. Run the blog seed once: `node scripts/seedBlogPosts.js`
3. Test API endpoints using the Swagger docs
4. Configure SMTP if you want email notifications
5. Test the admin dashboard functionality
6. Deploy to production with production environment variables
