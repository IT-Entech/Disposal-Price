require('dotenv').config();  // โหลดตัวแปรจากไฟล์ .env
const express = require('express');
const axios = require('axios'); // ใช้ axios ในการส่งคำขอ HTTP
const cors = require('cors');   // ใช้ CORS สำหรับให้ไคลเอนต์อื่นเข้าถึง API ได้

const app = express();
app.use(cors()); // อนุญาตให้ cross-origin request (ต้องเปิดใช้งานในกรณีที่ฝั่ง client และ server อยู่คนละ domain)

app.get('/maps', async (req, res) => {
  try {
    // ใช้ Axios ส่งคำขอไปยัง Google Maps API
    const response = await axios.get('https://maps.googleapis.com/maps/api/js', {
      params: {
        key: process.env.GOOGLE_MAPS_API_KEY,  // ใช้ API key จาก .env
        libraries: 'places',  // ใช้ Libraries ที่ต้องการ
        callback: 'initMap',   // กำหนด callback function (ในกรณีนี้เป็น initMap)
      }
    });
    
    res.send(response.data);  // ส่งข้อมูลที่ได้รับจาก Google Maps API กลับไปที่ฝั่ง client
  } catch (error) {
    res.status(500).send('Error fetching Google Maps API');  // ส่งข้อผิดพลาดในกรณีเกิดข้อผิดพลาด
  }
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
