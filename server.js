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

// 2. DATABASE CONNECTION POOL
// Using a pool is better for Render as it manages multiple connections automatically
const pool = mysql.createPool({
    host: process.env.DB_HOST,     // e.g., 'mysql-mihir.aivencloud.com'
    user: process.env.DB_USER,     // your database username
    password: process.env.DB_PASSWORD, 
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl: { rejectUnauthorized: false } // Required by most cloud SQL providers (Aiven/Railway)
});

const db = pool.promise();

// 3. SERVE FRONTEND (index.html)
// This serves your Three.js frontend when someone visits your domain
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
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

app.listen(PORT, '0.0.0.0', () => {
    console.log(`
    ===========================================
    KYNESIS ENGINE: ONLINE
    Port: ${PORT}
    Mode: Production
    ===========================================
    `);
});