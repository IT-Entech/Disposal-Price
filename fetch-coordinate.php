<?php
include_once '../connectDB/connectDB.php';
$objCon = connectDB(); 
if ($objCon === false) {
    error_log("Database connection failed: " . print_r(sqlsrv_errors(), true)); 
    die(json_encode(['error' => 'Database connection failed.']));
}

$wastecode = isset($_POST['WasteCode']) ? $_POST['WasteCode'] : '';
$search = "%" . $wastecode . "%";
// Query for supplier_code
$sql = "SELECT supplier_code FROM disposal_price WHERE waste_code LIKE ? ";
$params1 = array($search);
$stmt1 = sqlsrv_query($objCon, $sql, $params1);

if ($stmt1 === false) {
    error_log("SQL query (supplier_code) failed: " . print_r(sqlsrv_errors(), true));
    die(json_encode(['error' => 'SQL query failed (supplier_code).']));
}

// Fetch the supplier codes into an array
$supplier_codes = [];
while ($row = sqlsrv_fetch_array($stmt1, SQLSRV_FETCH_ASSOC)) {
    $supplier_codes[] = $row['supplier_code'];
}
// Check if no supplier codes were found
if (empty($supplier_codes)) {
    error_log("No supplier codes found for waste_code: " . $wastecode);
}
// If supplier codes are found, query for latitude and longitude
$coordinates = [];

    // Prepare placeholders dynamically
    $placeholders = implode(',', array_fill(0, count($supplier_codes), '?'));
    $query = "SELECT latitude, longitude FROM supplier_coordinate WHERE supplier_code IN ($placeholders)";
    $params = $supplier_codes;

    // Execute the query
    $stmt = sqlsrv_query($objCon, $query, $params);

    if ($stmt === false) {
        error_log("SQL query (coordinates) failed: " . print_r(sqlsrv_errors(), true));
        die(json_encode(['error' => 'SQL query failed (coordinates).']));
    }

    // Fetch the coordinates into an array
    while ($row = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC)) {
        $coordinates[] = $row;
        error_log("Coordinate: " . print_r($row, true));  // Log each coordinate
    }


// Return the response as JSON
$response = [
    'supplier_codes' => $supplier_codes,
    'coordinates' => $coordinates
];

echo json_encode($response);

// Free statement resources
sqlsrv_free_stmt($stmt1);
sqlsrv_free_stmt($stmt);
sqlsrv_close($objCon);
?>
