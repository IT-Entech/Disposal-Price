<?php
include_once '../connectDB/connectDB.php';

// เชื่อมต่อฐานข้อมูล
$connection = connectDB();
if ($connection === false) {
    error_log("Database connection failed: " . print_r(sqlsrv_errors(), true));
    respondWithError("Database connection failed.");
}

// รับค่า WasteCode จาก POST
$wasteCode = isset($_POST['WasteCode']) ? $_POST['WasteCode'] : '';
$searchWasteCode = "%" . $wasteCode . "%";

// ฟังก์ชันสำหรับดึงข้อมูล supplier ที่เกี่ยวข้องกับ waste code
function getSuppliersByWasteCode($conn, $searchCode) {
    $sql = "
        SELECT 
            A.supplier_code, 
            A.supplier_account_no,
            B.latitude, 
            B.longitude, 
            A.waste_code, 
            A.disposal_code, 
            A.disposal_cost
        FROM ms_waste_disposal A
        LEFT JOIN supplier_coordinate B 
            ON A.supplier_code = B.supplier_code 
            AND A.supplier_account_no = B.supplier_account_no
        WHERE A.waste_code LIKE ?
    ";

    $params = [$searchCode];
    $stmt = sqlsrv_query($conn, $sql, $params);

    if ($stmt === false) {
        error_log("Query getSuppliersByWasteCode failed: " . print_r(sqlsrv_errors(), true));
        respondWithError("Query failed when retrieving supplier data.");
    }

    $result = [
        'supplier_codes' => [],
        'account_numbers' => [],
        'latitudes' => [],
        'longitudes' => [],
        'waste_codes' => [],
        'disposal_codes' => [],
        'disposal_prices' => [],
    ];

    while ($row = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC)) {
        $result['supplier_codes'][] = $row['supplier_code'];
        $result['account_numbers'][] = $row['supplier_account_no'];
        $result['latitudes'][] = $row['latitude'] ?? null;
        $result['longitudes'][] = $row['longitude'] ?? null;
        $result['waste_codes'][] = $row['waste_code'];
        $result['disposal_codes'][] = $row['disposal_code'];
        $result['disposal_prices'][] = $row['disposal_cost'];
    }

    sqlsrv_free_stmt($stmt);
    return $result;
}

// ฟังก์ชันดึงพิกัดซ้ำ (หากต้องการ – สามารถลบออกได้ถ้าไม่จำเป็น)
function getCoordinatesBySuppliers($conn, $supplierCodes) {
    if (empty($supplierCodes)) {
        return [];
    }

    $placeholders = implode(',', array_fill(0, count($supplierCodes), '?'));
    $sql = "SELECT latitude, longitude FROM supplier_coordinate WHERE supplier_code IN ($placeholders)";
    
    $stmt = sqlsrv_query($conn, $sql, $supplierCodes);
    if ($stmt === false) {
        error_log("Query getCoordinatesBySuppliers failed: " . print_r(sqlsrv_errors(), true));
        respondWithError("Query failed when retrieving coordinates.");
    }

    $coordinates = [];
    while ($row = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC)) {
        $coordinates[] = $row;
        error_log("Coordinate: " . print_r($row, true));  // Optional Logging
    }

    sqlsrv_free_stmt($stmt);
    return $coordinates;
}

// ฟังก์ชันตอบกลับ error แบบ JSON แล้วจบการทำงาน
function respondWithError($message) {
    echo json_encode(['error' => $message]);
    exit;
}

// ดึงข้อมูลจากฐานข้อมูล
$supplierData = getSuppliersByWasteCode($connection, $searchWasteCode);

// หากไม่มี supplier ใดตรงเงื่อนไข ให้ตอบกลับเป็นข้อมูลว่าง
if (empty($supplierData['supplier_codes'])) {
    error_log("No suppliers found for waste_code: " . $wasteCode);
    echo json_encode($supplierData);
    sqlsrv_close($connection);
    exit;
}

// (Optional) ดึงข้อมูล coordinates ซ้ำอีกครั้ง (หากต้องการเพิ่มใน response)
$coordinates = getCoordinatesBySuppliers($connection, $supplierData['supplier_codes']);

// รวมข้อมูลทั้งหมดใน response
$response = array_merge($supplierData, ['coordinates' => $coordinates]);

// ตอบกลับเป็น JSON
echo json_encode($response);

// ปิดการเชื่อมต่อ
sqlsrv_close($connection);
?>
