<?php
include_once '../connectDB/connectDB.php';
$objCon = connectDB(); 

if ($objCon === false) {
    // Log errors and return a generic error message
    error_log("Database connection failed: " . print_r(sqlsrv_errors(), true)); 
    die(json_encode(['error' => 'Database connection failed.']));
}

// Get the wastename from the POST request
$wastename = isset($_POST['wastename']) ? $_POST['wastename'] : '';
$search = "%" . $wastename . "%";

// Query for waste_name (For datalist)
$sql = "SELECT DISTINCT B.waste_name
        FROM disposal_price A
        INNER JOIN so_detail_order B ON A.waste_code = B.waste_code
        WHERE A.waste_code LIKE '%-S%' 
        AND B.waste_name LIKE ?";
$params1 = array($search);

$stmt1 = sqlsrv_query($objCon, $sql, $params1);

if ($stmt1 === false) {
    die(print_r(sqlsrv_errors(), true));
}

// Prepare waste_name results for datalist
$waste_names = [];
while ($row = sqlsrv_fetch_array($stmt1, SQLSRV_FETCH_ASSOC)) {
    $waste_names[] = ['waste_name' => $row['waste_name']];
}

// Query for waste_code and waste_name (For select)
$query = "SELECT DISTINCT A.waste_code, C.waste_name
          FROM disposal_price A
          INNER JOIN so_detail_order B ON A.waste_code = B.waste_code
          LEFT JOIN ms_waste C ON A.waste_code = C.waste_code
          WHERE A.waste_code LIKE '%-S%' 
          AND B.waste_name LIKE ?";
$params = array($search);
$stmt = sqlsrv_query($objCon, $query, $params);

if ($stmt === false) {
    error_log("SQL query failed: " . print_r(sqlsrv_errors(), true));
    die(json_encode(['error' => 'SQL query failed.']));
}

// Prepare waste_codes results for select
$waste_codes = [];
while ($row = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC)) {
    $waste_codes[] = $row;
}

// Combine both results into a single array
$response = [
    'waste_name' => $waste_names,
    'waste_codes' => $waste_codes
];

// Return the response as JSON
echo json_encode($response);

// Close the database connection
sqlsrv_free_stmt($stmt1);
sqlsrv_free_stmt($stmt);
sqlsrv_close($objCon);
?>
