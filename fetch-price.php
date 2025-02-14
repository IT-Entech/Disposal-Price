<?php
include_once '../connectDB/connectDB.php';
$objCon = connectDB(); 

if ($objCon === false) {
    error_log("Database connection failed: " . print_r(sqlsrv_errors(), true)); 
    die(json_encode(['error' => 'Database connection failed.']));
}

// Get the latitude, longitude, and waste code from the POST request
$latitude = isset($_POST['lat']) ? $_POST['lat'] : '';
$longitude = isset($_POST['lng']) ? $_POST['lng'] : '';
$wastecode = isset($_POST['WasteCode']) ? $_POST['WasteCode'] : '';

// Validate latitude and longitude (ensure they are numeric)
if (!is_numeric($latitude) || !is_numeric($longitude)) {
    die(json_encode(['error' => 'Invalid latitude or longitude.']));
}

// Create search pattern for waste code
$search = "%" . $wastecode . "%";

// Prepare SQL query
$sql = "SELECT 
    A.supplier_code, 
    A.latitude, 
    A.longitude, 
    B.waste_code, 
    B.disposal_code, 
    disposal_price
FROM 
    supplier_coordinate A
LEFT JOIN 
    disposal_price B ON A.supplier_code = B.supplier_code
WHERE 
    A.latitude = ?
    AND A.longitude = ?
    AND B.waste_code LIKE ?
";
$params = array($latitude, $longitude, $search);

$stmt = sqlsrv_query($objCon, $sql, $params);

if ($stmt === false) {
    die(json_encode(['error' => 'Query failed.']));
}

$disposal_prices = [];  // Initialize an array to store the disposal prices

// Fetch the results and store them in the array
while ($row = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC)) {
    $disposal_price = $row['disposal_price'];
    
    // Check if disposal_price is valid
    if (is_numeric($disposal_price)) {
        $disposal_prices[] = ['disposal_price' => $disposal_price];
    } else {
        $disposal_prices[] = ['disposal_price' => 'Invalid price'];
    }
}

// Return the response as JSON
echo json_encode(['disposal_prices' => $disposal_prices]);

// Close the database connection
sqlsrv_free_stmt($stmt);
sqlsrv_close($objCon);
?>
