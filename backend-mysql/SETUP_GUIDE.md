# 🚀 MySQL Contact Form Backend - Complete Setup Guide

## 📋 What You Have

✅ **Complete MySQL Backend System**
- Node.js Express server (`backend-mysql/server.js`)
- MySQL database integration with connection pooling
- RESTful API endpoints for contact form
- Admin panel to view submissions (`backend-mysql/admin.html`)
- Input validation and error handling
- CORS enabled for frontend integration

✅ **Frontend Integration**
- Updated contact form in `index.html` (added phone field)
- Modified `js/script.js` to connect to MySQL backend
- Form now sends data to `http://localhost:3001/api/contact`

## 🛠️ Setup Instructions

### 1. Install Required Software

**MySQL Server:**
- Download from: https://dev.mysql.com/downloads/mysql/
- Install and remember your root password
- Make sure MySQL service is running

**Node.js:**
- Download from: https://nodejs.org/
- Install the LTS version

### 2. Configure Database

Open MySQL Command Line or MySQL Workbench and run:

```sql
-- Create the database (optional - server will create it automatically)
CREATE DATABASE orrya_contacts;

-- Create a dedicated user (recommended for security)
CREATE USER 'orrya_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON orrya_contacts.* TO 'orrya_user'@'localhost';
FLUSH PRIVILEGES;
```

### 3. Configure Backend

Navigate to the backend directory:
```bash
cd "c:\suvijya\projects\orryawebsitefinal\backend-mysql"
```

Edit `.env` file with your MySQL credentials:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_root_password
DB_NAME=orrya_contacts
DB_PORT=3306
PORT=3001
NODE_ENV=development
FRONTEND_URL=*
```

### 4. Install Dependencies & Start Server

```bash
# Install packages
npm install

# Start the server
npm start
```

You should see:
```
✅ Connected to MySQL database
✅ Database table initialized successfully
🚀 Server running on http://localhost:3001
```

## 🧪 Testing the System

### Test the API directly:

**Health Check:**
```bash
curl http://localhost:3001/api/health
```

**Submit a test contact:**
```bash
curl -X POST http://localhost:3001/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "company": "Test Company",
    "phone": "+1234567890",
    "service": "ai-ml",
    "message": "This is a test message from the contact form."
  }'
```

### Test the Frontend:

1. Open your `index.html` file in a browser
2. Scroll to the contact form
3. Fill out and submit the form
4. You should see a success message

### View Submissions:

1. Open `backend-mysql/admin.html` in your browser
2. You'll see all contact submissions with statistics
3. You can update the status of each contact

## 📊 Database Schema

The system automatically creates this table:

```sql
CREATE TABLE contacts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    company VARCHAR(255),
    phone VARCHAR(50),
    service VARCHAR(255),
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('new', 'read', 'responded') DEFAULT 'new'
);
```

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Check server health |
| POST | `/api/contact` | Submit contact form |
| GET | `/api/contacts` | Get all contacts (admin) |
| PATCH | `/api/contacts/:id/status` | Update contact status |

## 🎯 Production Deployment

For production use:

1. **Security:**
   - Use environment variables for all sensitive data
   - Set up proper MySQL user with limited privileges
   - Enable SSL/HTTPS
   - Add rate limiting

2. **Performance:**
   - Use a process manager like PM2
   - Set up MySQL connection pooling (already included)
   - Add caching if needed

3. **Monitoring:**
   - Add logging (Winston recommended)
   - Set up error tracking
   - Monitor MySQL performance

## 🚨 Troubleshooting

**"Database connection failed":**
- Check MySQL service is running
- Verify credentials in `.env` file
- Make sure MySQL is accepting connections on port 3306

**"CORS error":**
- Update `FRONTEND_URL` in `.env` to match your domain
- For development, `*` allows all origins

**"Port already in use":**
- Change `PORT` in `.env` file
- Update frontend URL in `js/script.js` accordingly

## ✨ Features Included

- ✅ Form validation (client & server side)
- ✅ Email format validation
- ✅ Phone number validation
- ✅ SQL injection protection
- ✅ Error handling and logging
- ✅ Admin panel with statistics
- ✅ Status tracking (new/read/responded)
- ✅ Responsive design
- ✅ Real-time form feedback

Your contact form is now connected to a robust MySQL database with a professional admin interface! 🎉
