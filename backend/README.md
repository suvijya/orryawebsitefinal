# Orrya Contact System Backend

A Python Flask backend with Supabase integration for handling contact form submissions and admin management.

## Features

- ✅ Contact form API with validation
- ✅ Admin authentication with JWT
- ✅ Submission management dashboard
- ✅ Status tracking (new, in_progress, resolved, archived)
- ✅ Real-time statistics
- ✅ Responsive admin UI
- ✅ Supabase database integration

## Quick Setup

### 1. Database Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Run the SQL in `database_schema.sql` in your Supabase SQL editor
3. Note your Supabase URL and anon key

### 2. Backend Setup

```bash
cd backend
pip install -r requirements.txt
```

### 3. Environment Configuration

1. Copy `.env.example` to `.env`
2. Update the following values:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key
JWT_SECRET=your_random_jwt_secret_here
```

### 4. Generate Admin Password

```bash
python generate_password_hash.py
```

Update your `.env` file with the generated hash:
```env
ADMIN_PASSWORD_HASH=generated_hash_here
```

### 5. Run the Backend

```bash
python app.py
```

Backend will be available at `http://localhost:5000`

### 6. Admin Dashboard

Open `admin.html` in your browser and login with:
- Username: `admin` (or your custom username from .env)
- Password: The password you used in step 4

## API Endpoints

### Public Endpoints

- `POST /api/contact` - Submit contact form
- `GET /health` - Health check

### Admin Endpoints (require authentication)

- `POST /api/admin/login` - Admin login
- `GET /api/admin/submissions` - Get all submissions
- `PATCH /api/admin/submissions/:id/status` - Update submission status
- `GET /api/admin/stats` - Get dashboard statistics

## Frontend Integration

The contact form in `index.html` is already configured to use the backend API. Make sure:

1. Backend is running on `http://localhost:5000`
2. Update the API_BASE constant in `js/script.js` if using a different URL

## Database Schema

The system uses a single table `contact_submissions` with the following fields:

- `id` - Primary key
- `name` - Contact name (required)
- `email` - Email address (required)
- `company` - Company name (optional)
- `phone` - Phone number (optional)
- `message` - Message content (required)
- `status` - Submission status (new/in_progress/resolved/archived)
- `submitted_at` - Timestamp
- `updated_at` - Last update timestamp

## Security Features

- Password hashing with bcrypt
- JWT token authentication for admin
- Input validation and sanitization
- SQL injection protection via Supabase
- CORS protection
- Row Level Security in Supabase

## Production Deployment

For production:

1. Set `FLASK_ENV=production` in .env
2. Use a proper WSGI server like Gunicorn
3. Set up SSL/HTTPS
4. Use environment variables instead of .env file
5. Configure Supabase RLS policies properly
6. Set up proper CORS origins

## Troubleshooting

### Common Issues

1. **CORS errors**: Make sure Flask-CORS is installed and configured
2. **Supabase connection**: Check your URL and key in .env
3. **Admin login fails**: Verify password hash generation
4. **Form submissions fail**: Check network requests in browser dev tools

### Logs

Check the Flask console for error messages and debugging info.

## Support

For issues with this system, check:
1. All environment variables are set correctly
2. Supabase database schema is applied
3. All Python dependencies are installed
4. Backend server is running and accessible
