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
$query = "SELECT DISTINCT(A.waste_code),D.waste_name from cost_sheet_detail A 
LEFT JOIN cost_sheet_head B ON A.qt_no = B.qt_no
LEFT JOIN so_detail C ON B.qt_no = C.qt_no
LEFT JOIN ms_waste D ON A.waste_code = D.waste_code
WHERE   A.waste_code LIKE '%-S%' 
AND cost_code IN ('51100')
AND YEAR(qt_date) >= 2023
/*AND MONTH(qt_date) = 12*/
AND A.waste_code NOT IN ('000000-S', '000002-S')
AND B.is_status = 'A'
AND B.customer_code IS NOT NULL
AND B.is_approve ='Y'
AND B.qt_no = C.qt_no
/*AND A.supplier_code = 'อ-10008'*/
AND A.unit_code = '01'
AND A.waste_name LIKE ?
";
// Prepare and execute the query
$params = array("%$wastename%");
$stmt = sqlsrv_query($objCon, $query, $params);
if ($stmt === false) {
    error_log("SQL query failed: " . print_r(sqlsrv_errors(), true));
    die(json_encode(['error' => 'SQL query failed.']));
}
// Fetch the results
$waste_codes = [];
while ($row = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC)) {
    $waste_codes[] = $row;  // Add each result to the waste_codes array
}
// Return the waste codes as JSON
echo json_encode(['waste_codes' => $waste_codes]);
// Close the database connection
sqlsrv_free_stmt($stmt);
sqlsrv_close($objCon);
?>