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
    user: process.env.USERNAME,
    password: process.env.PASSWORD,
    server: process.env.SERVER, 
    database: process.env.DATABASE,
    options: {
        encrypt: false, // ถ้าใช้ Azure ให้ตั้งค่านี้เป็น true
        trustServerCertificate: false, // กรณีใช้ certificate ภายใน
    }
};

// Route สำหรับรับข้อมูลจาก Client และส่งไป SQL Server
app.post('/submit-data', async (req, res) => {
    try {
        // รับข้อมูลจาก Client
        const { field1, field2 } = req.body;

        // เชื่อมต่อกับ SQL Server
        await sql.connect(config);
        const request = new sql.Request();

        // ส่งข้อมูลไปยัง SQL Server
        const query = `INSERT INTO your_table (field1, field2) VALUES (@field1, @field2)`;
        request.input('field1', sql.VarChar, field1);
        request.input('field2', sql.VarChar, field2);
        await request.query(query);

        res.status(200).send('Data inserted successfully');
    } catch (err) {
        console.error(err);
        res.status(500).send('Database error');
    }
});

// Route สำหรับเรียกข้อมูลจาก Google Maps API
app.get('/maps', async (req, res) => {
  try {
    // ใช้ Axios ส่งคำขอไปยัง Google Maps API
    const response = await axios.get('https://maps.googleapis.com/maps/api/js', {
      params: {
        key: process.env.GOOGLE_MAPS_API_KEY,  // ใช้ API key จาก .env
        libraries: 'places',  // ใช้ Libraries ที่ต้องการ
        callback: 'initMap',   // กำหนด callback function
      }
    });
    
    res.send(response.data);  // ส่งข้อมูลที่ได้รับจาก Google Maps API กลับไปที่ฝั่ง client
  } catch (error) {
    res.status(500).send('Error fetching Google Maps API');  // ส่งข้อผิดพลาดในกรณีเกิดข้อผิดพลาด
  }
});

// เริ่ม Server
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
