# How to Access the Admin Dashboard

## Quick Access Steps

### Step 1: Create an Admin User

You need to create a user account with `role: 'admin'` in the database. Here are your options:

#### Option A: Using the Script (Easiest)

1. Make sure your MongoDB is connected and the server can access it
2. Run the create admin script:

```bash
cd backend
node scripts/createAdmin.js admin@example.com YourSecurePassword123! "Admin Name"
```

Replace:
- `admin@example.com` with your email
- `YourSecurePassword123!` with a secure password (must meet requirements: 8+ chars, uppercase, lowercase, number, special char)
- `"Admin Name"` with your name (optional)

#### Option B: Promote Existing User via Database

If you already have a user account:

1. Connect to your MongoDB database
2. Find your user and update the role:

```javascript
// In MongoDB shell or Compass
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "admin" } }
)
```

#### Option C: Sign Up First, Then Promote

1. Go to your website and sign up with a regular account
2. Note your email address
3. Use Option B above to promote that user to admin

### Step 2: Log In

1. Go to your website: `http://localhost:5173`
2. Click "Sign In" in the header
3. Enter your admin email and password
4. Click "Sign In"

### Step 3: Access Admin Dashboard

Once logged in as admin, you have two ways to access:

**Method 1: Direct URL**
- Navigate to: `http://localhost:3000/admin`

**Method 2: Via Header Menu**
- Click on your profile picture/avatar in the top right
- Click "Admin Panel" (this option only appears for admin users)

## Admin Dashboard Features

Once you access `/admin`, you'll see tabs for:

1. **Dashboard** - Overview with stats and quick actions
2. **Blog Posts** - Create, edit, delete blog posts
3. **Contacts** - Manage contact form submissions
4. **Users** - View and manage users, promote/demote admins
5. **Orders** - View and manage customer orders

## Troubleshooting

### "Access Denied" or Redirected to Home Page

- Make sure you're logged in
- Verify your user has `role: 'admin'` in the database
- Try logging out and logging back in
- Check browser console for errors

### Can't See "Admin Panel" in Menu

- Your user role is not set to 'admin'
- Use the script or database to set your role to 'admin'
- Log out and log back in

### MongoDB Connection Issues

- Make sure your MongoDB Atlas cluster is running (not paused)
- Verify the connection string in `.env` is correct
- Check network access in MongoDB Atlas (whitelist your IP)

## Password Requirements

When creating an admin account, the password must:
- Be at least 8 characters long
- Contain at least one uppercase letter
- Contain at least one lowercase letter
- Contain at least one number
- Contain at least one special character

Example: `Admin123!` or `MySecurePass456@`
