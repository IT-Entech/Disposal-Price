<?php
include_once '../connectDB/connectDB.php';
$objCon = connectDB();

$timezone = new DateTimeZone('Asia/Bangkok'); // Setting the timezone
$date = new DateTime('now', $timezone);
$record_datetime = $date->format('Y-m-d H:i:s'); // Current date and time
// Check if the file exists and read its contents
// Establishes the connection to SQL Server


// JSON file path
$jsonFilePath = './data.json';

if (file_exists($jsonFilePath)) {
    // Get JSON data from the file
    $jsonData = file_get_contents($jsonFilePath);

    // Decode the JSON data into an array
    $data = json_decode($jsonData, true);

    if ($data) {
        // Extract data from the decoded JSON array
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

        // Prepare SQL INSERT statement
        $sql = "INSERT INTO temp_cs_head 
            (customer_name, waste_code, waste_name, disposal_code, supplier_code, total_before_vat, 
            distance, disposal_value, weight, fix_cost, vehicle_type, consumption_rate, allowance, 
            contact_name, email, tel, time_service, qt_status) 
            VALUES 
            (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

        // Prepare parameters for SQL
        $params = array(
            $companyName, $wastecode, $wastename, $disposal_Code, $supplier_Code, $Total_before_vat,
            $DistanceKM, $disposal_Cost, $weight, $fixCosts, $vehicle_type, $consumption,
            $Allowance, $contactname, $Email, $Tel, $services, $serviceInterested
        );
        

        // Prepare and execute the SQL statement
        $stmt = sqlsrv_prepare($objCon, $sql, $params);

        // Check if the insert was successful
        if ($stmt === false) {
            die(print_r(sqlsrv_errors(), true)); // Print errors if the insert fails
        } else {
            // Execute the query and check for success
            if (sqlsrv_execute($stmt)) {
                echo "Data inserted successfully"; // Success message
            } else {
                die(print_r(sqlsrv_errors(), true)); // Print errors if the query fails
            }
        }
    } else {
        echo 'Invalid JSON format'; // If the JSON is not valid
    }
} else {
    echo 'JSON file not found'; // If the file doesn't exist
}
    sqlsrv_close($objCon);
    

