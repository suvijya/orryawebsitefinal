from flask import Flask, request, jsonify
from flask_cors import CORS
from supabase import create_client, Client
import os
from dotenv import load_dotenv
import bcrypt
import jwt
from datetime import datetime, timedelta, timezone
import re
from email_validator import validate_email, EmailNotValidError

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Supabase configuration
url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(url, key)

# Admin configuration
ADMIN_USERNAME = os.environ.get("ADMIN_USERNAME", "admin")
ADMIN_PASSWORD_HASH = os.environ.get("ADMIN_PASSWORD_HASH")
JWT_SECRET = os.environ.get("JWT_SECRET")

def validate_contact_data(data):
    """Validate contact form data"""
    errors = []
    
    # Required fields
    required_fields = ['name', 'email', 'message']
    for field in required_fields:
        if not data.get(field) or not data[field].strip():
            errors.append(f"{field.capitalize()} is required")
    
    # Email validation
    if data.get('email'):
        try:
            validate_email(data['email'])
        except EmailNotValidError:
            errors.append("Invalid email address")
    
    # Length validations
    if data.get('name') and len(data['name']) > 100:
        errors.append("Name must be less than 100 characters")
    
    if data.get('company') and len(data['company']) > 100:
        errors.append("Company name must be less than 100 characters")
    
    if data.get('message') and len(data['message']) > 2000:
        errors.append("Message must be less than 2000 characters")
    
    # Phone validation (optional)
    if data.get('phone'):
        phone_pattern = r'^[\+]?[1-9][\d\s\-\(\)]{6,15}$'
        if not re.match(phone_pattern, data['phone']):
            errors.append("Invalid phone number format")
    
    return errors

def generate_admin_token():
    """Generate JWT token for admin authentication"""
    payload = {
        'username': ADMIN_USERNAME,
        'exp': datetime.now(timezone.utc) + timedelta(hours=24)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm='HS256')

def verify_admin_token(token):
    """Verify JWT token for admin authentication"""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
        return payload['username'] == ADMIN_USERNAME
    except jwt.ExpiredSignatureError:
        return False
    except jwt.InvalidTokenError:
        return False

@app.route('/api/contact', methods=['POST'])
def submit_contact():
    """Handle contact form submissions"""
    try:
        data = request.get_json()
        
        # Validate input data
        errors = validate_contact_data(data)
        if errors:
            return jsonify({'error': 'Validation failed', 'details': errors}), 400
        
        # Prepare data for database
        contact_data = {
            'name': data['name'].strip(),
            'email': data['email'].strip().lower(),
            'company': data.get('company', '').strip() if data.get('company') else None,
            'phone': data.get('phone', '').strip() if data.get('phone') else None,
            'message': data['message'].strip(),
            'submitted_at': datetime.now(timezone.utc).isoformat(),
            'status': 'new'
        }
        
        # Insert into Supabase
        result = supabase.table('contact_submissions').insert(contact_data).execute()
        
        if result.data:
            return jsonify({
                'success': True,
                'message': 'Thank you for your message! We\'ll get back to you soon.'
            }), 201
        else:
            return jsonify({'error': 'Failed to save submission'}), 500
            
    except Exception as e:
        print(f"Error submitting contact form: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/admin/login', methods=['POST'])
def admin_login():
    """Admin login endpoint"""
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        
        if not username or not password:
            return jsonify({'error': 'Username and password required'}), 400
        
        # Check credentials
        if username == ADMIN_USERNAME and bcrypt.checkpw(password.encode('utf-8'), ADMIN_PASSWORD_HASH.encode('utf-8')):
            token = generate_admin_token()
            return jsonify({
                'success': True,
                'token': token,
                'message': 'Login successful'
            }), 200
        else:
            return jsonify({'error': 'Invalid credentials'}), 401
            
    except Exception as e:
        print(f"Error during admin login: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/admin/submissions', methods=['GET'])
def get_submissions():
    """Get all contact submissions (admin only)"""
    try:
        # Check authorization
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Authorization required'}), 401
        
        token = auth_header.split(' ')[1]
        if not verify_admin_token(token):
            return jsonify({'error': 'Invalid or expired token'}), 401
        
        # Get query parameters
        status = request.args.get('status')
        limit = int(request.args.get('limit', 50))
        offset = int(request.args.get('offset', 0))
        
        # Build query
        query = supabase.table('contact_submissions').select('*')
        
        if status:
            query = query.eq('status', status)
        
        # Execute query with pagination
        result = query.order('submitted_at', desc=True).limit(limit).range(offset, offset + limit - 1).execute()
        
        # Get total count
        count_result = supabase.table('contact_submissions').select('id', count='exact').execute()
        total = len(count_result.data) if count_result.data else 0
        
        return jsonify({
            'success': True,
            'data': result.data,
            'total': total,
            'limit': limit,
            'offset': offset
        }), 200
        
    except Exception as e:
        print(f"Error fetching submissions: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/admin/submissions/<int:submission_id>/status', methods=['PATCH'])
def update_submission_status(submission_id):
    """Update submission status (admin only)"""
    try:
        # Check authorization
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Authorization required'}), 401
        
        token = auth_header.split(' ')[1]
        if not verify_admin_token(token):
            return jsonify({'error': 'Invalid or expired token'}), 401
        
        data = request.get_json()
        new_status = data.get('status')
        
        if new_status not in ['new', 'in_progress', 'resolved', 'archived']:
            return jsonify({'error': 'Invalid status'}), 400
        
        # Update status
        result = supabase.table('contact_submissions').update({
            'status': new_status,
            'updated_at': datetime.now(timezone.utc).isoformat()
        }).eq('id', submission_id).execute()
        
        if result.data:
            return jsonify({
                'success': True,
                'message': 'Status updated successfully'
            }), 200
        else:
            return jsonify({'error': 'Submission not found'}), 404
            
    except Exception as e:
        print(f"Error updating submission status: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/admin/stats', methods=['GET'])
def get_admin_stats():
    """Get dashboard statistics (admin only)"""
    try:
        # Check authorization
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Authorization required'}), 401
        
        token = auth_header.split(' ')[1]
        if not verify_admin_token(token):
            return jsonify({'error': 'Invalid or expired token'}), 401
        
        # Get various statistics
        stats = {}
        
        # Total submissions
        total_result = supabase.table('contact_submissions').select('id', count='exact').execute()
        stats['total_submissions'] = len(total_result.data) if total_result.data else 0
        
        # Submissions by status
        for status in ['new', 'in_progress', 'resolved', 'archived']:
            status_result = supabase.table('contact_submissions').select('id', count='exact').eq('status', status).execute()
            stats[f'{status}_submissions'] = len(status_result.data) if status_result.data else 0
        
        # Recent submissions (last 7 days)
        week_ago = (datetime.now(timezone.utc) - timedelta(days=7)).isoformat()
        recent_result = supabase.table('contact_submissions').select('id', count='exact').gte('submitted_at', week_ago).execute()
        stats['recent_submissions'] = len(recent_result.data) if recent_result.data else 0
        
        return jsonify({
            'success': True,
            'stats': stats
        }), 200
        
    except Exception as e:
        print(f"Error fetching admin stats: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'timestamp': datetime.now(timezone.utc).isoformat()}), 200

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
