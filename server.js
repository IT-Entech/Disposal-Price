
require('dotenv').config();  // โหลดตัวแปรจากไฟล์ .env
const express = require('express');
const axios = require('axios'); // ใช้ axios ในการส่งคำขอ HTTP
const cors = require('cors');   // ใช้ CORS สำหรับให้ไคลเอนต์อื่นเข้าถึง API ได้
const sql = require('mssql');
const bodyParser = require('body-parser');

const app = express();
app.use(cors()); // อนุญาตให้ cross-origin request
app.use(bodyParser.json()); // รองรับการรับข้อมูล JSON จาก client

// การตั้งค่าเชื่อมต่อ SQL Server
const config = {
    user: 'sa',
    password: process.env.PASSWORD,
    server: process.env.SERVER,
    database: process.env.DATABASE,
    port: parseInt(process.env.DB_PORT, 10) || 1433, 
    options: {
        encrypt: false, // ถ้าใช้ Azure ให้ตั้งค่านี้เป็น true
        trustServerCertificate: true, // กรณีใช้ certificate ภายใน
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
let pool;
async function getPool() {
  if (!pool) {
    pool = await new sql.ConnectionPool(config).connect();
  }
  return pool;
}
// Route สำหรับรับข้อมูลจาก Client และส่งไป SQL Server
app.post('/submit-data', async (req, res) => {
    try {
        // รับข้อมูลจาก Client
        const { companyName, wastecode, wastename, disposal_Code, supplier_Code, Total_before_vat, DistanceKM,disposal_Cost, weight, fixCosts, vehicle_type, consumption, Allowance, contactname, Email, Tel, services, serviceInterested } = req.body;
        const pool = await getPool();  // Use existing pool
        const request = pool.request();  // Create request from pool
        // เชื่อมต่อกับ SQL Server
        request.input('companyName', sql.VarChar(50), companyName);
        request.input('wastecode', sql.VarChar(10), wastecode);
        request.input('wastename', sql.VarChar(50), wastename);
        request.input('disposal_Code', sql.Char(3), disposal_Code);
        request.input('supplier_Code', sql.VarChar(10), supplier_Code);
        request.input('Total_before_vat', sql.Decimal(18,2), Total_before_vat);
        request.input('DistanceKM', sql.Decimal(18,2), DistanceKM);
        request.input('disposal_Cost', sql.Decimal(18,2), disposal_Cost);
        request.input('weight', sql.Decimal(18,2), weight);
        request.input('fixCosts', sql.Decimal(18,2), fixCosts);
        request.input('vehicle_type', sql.VarChar(50), vehicle_type);
        request.input('consumption', sql.Decimal(18,2), consumption);
        request.input('Allowance', sql.Decimal(18,2), Allowance);
        request.input('contactname', sql.VarChar(25), contactname);
        request.input('Email', sql.VarChar(50), Email);
        request.input('Tel', sql.VarChar(15), Tel);
        request.input('services', sql.Char(1), services);
        request.input('serviceInterested', sql.Char(1), serviceInterested);
        // ส่งข้อมูลไปยัง SQL Server
        const query = `INSERT INTO temp_cs_head (customer_name, waste_code, waste_name, disposal_code, supplier_code, total_before_vat, distance, disposal_value, weight, fix_cost, vehicle_type, consumption_rate, allowance, contact_name, email, tel, time_service, qt_status)
        VALUES (@companyName, @wastecode, @wastename, @disposal_Code, @supplier_Code, @Total_before_vat, @DistanceKM, @disposal_Cost, @weight, @fixCosts, @vehicle_type, @consumption, @Allowance, @contactname, @Email, @Tel, @services, @serviceInterested)`;
        await request.query(query);

        res.status(200).send('Data inserted successfully');

    } catch (err) {
        console.error(err);
        res.status(500).send('Database error');
    }
});



// เริ่ม Server
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
