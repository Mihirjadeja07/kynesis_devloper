const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// 1. MIDDLEWARE 
// Essential for cross-origin requests and parsing form data
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// 2. DATABASE CONNECTION POOL
// Using a pool is better for Render as it manages multiple connections automatically
const poolConfig = {
    host: process.env.DB_HOST,     // e.g., 'mysql-mihir.aivencloud.com'
    user: process.env.DB_USER,     // your database username
    password: process.env.DB_PASSWORD, 
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

if (String(process.env.DB_SSL || '').toLowerCase() === 'true') {
    poolConfig.ssl = { rejectUnauthorized: false };
}

const pool = mysql.createPool(poolConfig);

const db = pool.promise();

async function initializeDatabase() {
    await db.query(`
        CREATE TABLE IF NOT EXISTS internship_applications (
            id INT AUTO_INCREMENT PRIMARY KEY,
            fullname VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL,
            role VARCHAR(255),
            github_url VARCHAR(512),
            skills TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);
}

// 3. SERVE FRONTEND (index.html)
// This serves your Three.js frontend when someone visits your domain
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'about.html'));
});

app.get('/services', (req, res) => {
    res.sendFile(path.join(__dirname, 'services.html'));
});

app.get('/process', (req, res) => {
    res.sendFile(path.join(__dirname, 'process.html'));
});

app.get('/careers', (req, res) => {
    res.sendFile(path.join(__dirname, 'careers.html'));
});

app.get('/contact', (req, res) => {
    res.sendFile(path.join(__dirname, 'contact.html'));
});

// 4. API ENDPOINT: INTERNSHIP APPLICATION
app.post('/api/apply', async (req, res) => {
    const { name, email, role, github, skills } = req.body;

    // Basic Validation
    if (!name || !email) {
        return res.status(400).json({ success: false, message: "Name and Email are required." });
    }

    try {
        const query = `
            INSERT INTO internship_applications (fullname, email, role, github_url, skills) 
            VALUES (?, ?, ?, ?, ?)
        `;
        
        const [result] = await db.execute(query, [name, email, role, github, skills]);
        
        console.log(`[SUCCESS] New Applicant: ${name} (ID: ${result.insertId})`);
        res.status(200).json({ 
            success: true, 
            message: "Application logged to Kynesis Database.",
            id: result.insertId 
        });

    } catch (error) {
        console.error("[SQL ERROR]:", error.message);
        res.status(500).json({ success: false, message: "Database connection failed. Please try again later." });
    }
});

// 5. SERVER INITIALIZATION (RENDER READY)
// Using 0.0.0.0 is mandatory for Render to detect the port
const PORT = process.env.PORT || 10000; 

(async () => {
    try {
        await db.getConnection();
        await initializeDatabase();

        app.listen(PORT, '0.0.0.0', () => {
            console.log(`
    ===========================================
    KYNESIS ENGINE: ONLINE
    Port: ${PORT}
    Mode: Production
    Database: Connected
    ===========================================
    `);
        });
    } catch (error) {
        console.error('[DB INIT ERROR]:', error.message);
        process.exit(1);
    }
})();
