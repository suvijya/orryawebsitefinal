const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bodyParser = require('body-parser');
const validator = require('validator');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// MySQL Connection Pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'orrya_contacts',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test database connection
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Connected to MySQL database');
        connection.release();
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        process.exit(1);
    }
}

// Initialize database and table
async function initializeDatabase() {
    try {
        // Use a direct connection WITHOUT specifying database to allow creating it if missing
        const initConnection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD,
            port: process.env.DB_PORT || 3306,
            multipleStatements: true
        });

        const dbName = process.env.DB_NAME || 'orrya_contacts';

        // Create database if it doesn't exist
        await initConnection.execute(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
        await initConnection.execute(`USE \`${dbName}\``);

        // Create contacts table
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS contacts (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                company VARCHAR(255),
                phone VARCHAR(50),
                service VARCHAR(255),
                message TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                status ENUM('new', 'read', 'responded') DEFAULT 'new',
                INDEX idx_email (email),
                INDEX idx_created_at (created_at),
                INDEX idx_status (status)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `;

        await initConnection.execute(createTableQuery);
        await initConnection.end();

        console.log('✅ Database and table initialized successfully');
    } catch (error) {
        console.error('❌ Database initialization failed:', error.message);
        process.exit(1);
    }
}

// Validation middleware
function validateContactData(req, res, next) {
    const { name, email, message } = req.body;
    const errors = [];

    // Required fields
    if (!name || name.trim().length < 2) {
        errors.push('Name must be at least 2 characters long');
    }

    if (!email || !validator.isEmail(email)) {
        errors.push('Please provide a valid email address');
    }

    if (!message || message.trim().length < 10) {
        errors.push('Message must be at least 10 characters long');
    }

    // Optional fields validation
    if (req.body.phone && !validator.isMobilePhone(req.body.phone, 'any', { strictMode: false })) {
        errors.push('Please provide a valid phone number');
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors
        });
    }

    next();
}

// Routes

// Health check
app.get('/api/health', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        await connection.execute('SELECT 1');
        connection.release();
        
        res.json({
            success: true,
            message: 'Server and database are healthy',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Database connection failed'
        });
    }
});

// Submit contact form
app.post('/api/contact', validateContactData, async (req, res) => {
    const { name, email, company, phone, service, message } = req.body;
    
    try {
        const connection = await pool.getConnection();
        
        const insertQuery = `
            INSERT INTO contacts (name, email, company, phone, service, message)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        
        const [result] = await connection.execute(insertQuery, [
            name.trim(),
            email.toLowerCase().trim(),
            company ? company.trim() : null,
            phone ? phone.trim() : null,
            service ? service.trim() : null,
            message.trim()
        ]);
        
        connection.release();
        
        console.log(`📧 New contact submission: ${email} - ${name}`);
        
        res.status(201).json({
            success: true,
            message: 'Thank you for your message! We will get back to you soon.',
            contactId: result.insertId
        });
        
    } catch (error) {
        console.error('❌ Contact submission error:', error);
        
        // Handle duplicate email (if you want to prevent duplicates)
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                success: false,
                message: 'A contact with this email already exists.'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Failed to submit contact form. Please try again.'
        });
    }
});

// Get all contacts (for admin purposes)
app.get('/api/contacts', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [rows] = await connection.execute(
            'SELECT * FROM contacts ORDER BY created_at DESC'
        );
        connection.release();
        
        res.json({
            success: true,
            contacts: rows,
            total: rows.length
        });
    } catch (error) {
        console.error('❌ Failed to fetch contacts:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch contacts'
        });
    }
});

// Update contact status
app.patch('/api/contacts/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['new', 'read', 'responded'].includes(status)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid status. Must be: new, read, or responded'
        });
    }
    
    try {
        const connection = await pool.getConnection();
        const [result] = await connection.execute(
            'UPDATE contacts SET status = ? WHERE id = ?',
            [status, id]
        );
        connection.release();
        
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Contact not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Contact status updated successfully'
        });
    } catch (error) {
        console.error('❌ Failed to update contact status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update contact status'
        });
    }
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('❌ Unhandled error:', error);
    res.status(500).json({
        success: false,
        message: 'Internal server error'
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found'
    });
});

// Start server
async function startServer() {
    // Ensure DB exists and schema is ready BEFORE testing pool connection
    await initializeDatabase();
    await testConnection();

    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
        console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
}

startServer().catch(error => {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
});
