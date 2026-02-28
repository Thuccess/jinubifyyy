# Admin Dashboard Setup Guide

## How to Login as Admin

### Step 1: Create an Admin User

Run the admin creation script:

```bash
cd backend
node scripts/createAdmin.js
```

This will create an admin user with:
- **Email**: `admin@jinubify.com` (default)
- **Password**: `admin123` (default)
- **Name**: `Admin User` (default)

### Custom Admin Credentials

You can specify custom credentials:

```bash
node scripts/createAdmin.js <email> <password> <name>
```

Example:
```bash
node scripts/createAdmin.js admin@example.com MySecurePass123 Admin Name
```

### Step 2: Login as Admin

1. Start your frontend server:
   ```bash
   cd frontend
   npm run dev
   ```

2. Open your browser and navigate to the login page

3. Use the admin credentials:
   - **Email**: `admin@jinubify.com` (or your custom email)
   - **Password**: `admin123` (or your custom password)

4. After login, you'll see an "Admin Panel" option in your user menu (top right)

5. Click "Admin Panel" or navigate to `/admin` to access the admin dashboard

## Admin Dashboard Features

The admin dashboard (`/admin`) provides:

- **Statistics Overview**:
  - Total Users
  - Total Blog Posts
  - Contact Submissions
  - Total Orders
  - Pending Contacts
  - Published Posts

- **Quick Actions**:
  - Manage Blog Posts
  - View Contacts
  - User Management (coming soon)

## Admin API Endpoints

All admin endpoints require authentication and admin role:

- `GET /api/admin/stats` - Get dashboard statistics
- `GET /api/admin/users` - Get all users (with pagination)
- `GET /api/admin/contacts` - Get all contact submissions
- `PUT /api/admin/contacts/:id` - Update contact status

## Security Notes

⚠️ **Important**: 
- Change the default admin password after first login
- Admin routes are protected by middleware that checks for `role: 'admin'`
- Only users with admin role can access `/admin` route
- Admin endpoints require valid JWT token with admin role

## Updating Existing User to Admin

If you want to make an existing user an admin:

1. **Option 1**: Run the script with their email (it will update them to admin)
   ```bash
   node scripts/createAdmin.js existing@user.com newpassword
   ```

2. **Option 2**: Update directly in MongoDB:
   ```javascript
   db.users.updateOne(
     { email: "user@example.com" },
     { $set: { role: "admin" } }
   )
   ```

## Troubleshooting

### "Access Denied" Error
- Make sure you're logged in with an admin account
- Check that the user's role is set to "admin" in the database
- Verify your JWT token is valid

### Can't See Admin Panel Link
- Make sure you're logged in
- Check that `currentUser.role === 'admin'`
- Try logging out and logging back in
- Check browser console for errors

### Admin Script Fails
- Make sure MongoDB is running
- Check your `.env` file has correct `MONGODB_URI`
- Verify the backend server can connect to MongoDB

