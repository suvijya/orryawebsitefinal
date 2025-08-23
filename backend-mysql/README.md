# Orrya Contact Backend - MySQL

A Node.js Express server with MySQL database for handling contact form submissions.

## Features

- ✅ Express.js REST API
- ✅ MySQL database with connection pooling
- ✅ Input validation and sanitization
- ✅ CORS enabled for frontend integration
- ✅ Error handling and logging
- ✅ Health check endpoint
- ✅ Admin endpoints for viewing contacts

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend-mysql
npm install
```

### 2. Setup MySQL Database

Make sure you have MySQL installed and running. Create a database:

```sql
CREATE DATABASE orrya_contacts;
```

### 3. Configure Environment

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` with your MySQL credentials:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=orrya_contacts
DB_PORT=3306
PORT=3001
```

### 4. Start the Server

Development mode (with auto-restart):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will automatically:
- Create the database if it doesn't exist
- Create the contacts table with proper schema
- Start listening on http://localhost:3001

## API Endpoints

### POST /api/contact
Submit a new contact form.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "company": "Tech Corp",
  "phone": "+1234567890",
  "service": "AI Engineering",
  "message": "I'm interested in your services..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Thank you for your message! We will get back to you soon.",
  "contactId": 123
}
```

### GET /api/health
Check server and database health.

### GET /api/contacts
Get all contact submissions (admin endpoint).

### PATCH /api/contacts/:id/status
Update contact status to 'new', 'read', or 'responded'.

## Database Schema

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

## Testing

Test the API with curl:

```bash
# Health check
curl http://localhost:3001/api/health

# Submit contact form
curl -X POST http://localhost:3001/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "message": "This is a test message from the contact form."
  }'

# Get all contacts
curl http://localhost:3001/api/contacts
```

## Frontend Integration

Update your frontend JavaScript to call this API instead of the Supabase backend. See the updated `script.js` file.
