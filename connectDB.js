require('dotenv').config();
const sql = require('mssql');

const config = {
    user: 'sa',      // SQL Server username
    password: process.env.PASSWORD,  // SQL Server password
    server: process.env.SERVER,      // SQL Server name or IP address
    database: process.env.DATABASE,  // Database to connect to
    port: parseInt(process.env.DB_PORT, 10) || 1433,  // Default SQL Server port
    options: {
        encrypt: false,               // Set to true if using Azure
        trustServerCertificate: true  // For self-signed certificates
    }
};

async function connectToSQLServer() {
    try {
        await sql.connect(config);
        console.log('Login successful: Connected to SQL Server');
    } catch (err) {
        console.error('Login failed:', err);
    }
}

connectToSQLServer();
