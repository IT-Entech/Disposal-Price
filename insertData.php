<?php


// รับ JSON ที่ส่งมา
$json = file_get_contents('php://input');

// แปลง JSON เป็น array
$data = json_decode($json, true);
if ($data) {
    // สร้าง array สำหรับข้อมูลที่จะบันทึก
    $companyName = $data['companyName'];
    $wastecode = $data['wastecode'];
    $wastename = $data['wastename'];
    $disposal_Code = $data['disposal_Code'];
    $supplier_Code = $data['supplier_Code'];
    $Total_before_vat = $data['Total_before_vat'];
    $DistanceKM = $data['DistanceKM'];
    $disposal_Cost = $data['disposal_Cost'];
    $weight = $data['weight'];
    $fixCosts = $data['fixCosts'];
    $vehicle_type = $data['vehicle_type'];
    $consumption = $data['consumption'];
    $Allowance = $data['Allowance'];
    $contactname = $data['contactname'];
    $Email = $data['Email'];
    $Tel = $data['Tel'];
    $services = $data['services'];
    $serviceInterested = $data['serviceInterested'];

    // สร้าง array สำหรับบันทึกลง JSON
    $jsonData = json_encode($data, JSON_PRETTY_PRINT);

    // บันทึกข้อมูลลงในไฟล์ JSON
    $file = 'data.json';
    if (file_put_contents($file, $jsonData)) {
        echo 'Data successfully saved to ' . $file;
        include 'insertData1.php';
    } else {
        echo 'Error writing to file';
    }
 
} else {
    echo 'JSON file not found'; // If the file doesn't exist
}





