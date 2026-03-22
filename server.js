const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// 1. MIDDLEWARE
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 2. DATABASE CONNECTION
// We use a Connection Pool for better performance in a live environment
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'kynesis_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

const db = pool.promise();

// 3. SERVE FRONTEND (index.html)
// Since index.html is in the same folder, we send it on the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 4. API ENDPOINT: INTERNSHIP APPLICATION
app.post('/api/apply', async (req, res) => {
    const { name, email, role, github, skills } = req.body;

    if (!name || !email || !role) {
        return res.status(400).json({ success: false, message: "Missing required fields." });
    }

    try {
        const query = `
            INSERT INTO internship_applications (fullname, email, role, github_url, skills) 
            VALUES (?, ?, ?, ?, ?)
        `;
        
        const [result] = await db.execute(query, [name, email, role, github, skills]);
        
        console.log(`New Application Logged: ID ${result.insertId}`);
        res.status(200).json({ 
            success: true, 
            message: "Application successfully stored in Kynesis database.",
            id: result.insertId 
        });

    } catch (error) {
        console.error("SQL Error:", error);
        res.status(500).json({ success: false, message: "Database connection error." });
    }
});

// 5. SERVER INITIALIZATION
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`
    -------------------------------------------
    KYNESIS DEVELOPERS ENGINE STARTING...
    Status: Live
    URL: http://localhost:${PORT}
    -------------------------------------------
    `);
});