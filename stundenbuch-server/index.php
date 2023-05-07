<?php

require_once 'db_config.php';
require_once 'functions.php';
require_once 'pw_config.php';

// Password check
if ($_GET['pw1'] !== PW_1 && NO_PW_1 !== true) {
    die('Wrong password!');
}

// Connect to database
$conn = new mysqli(DB_HOST, DB_USER, DB_PASSWORD, DB_NAME);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Get current date
$date = date('Y-m-d');

// Prepare query to get data for given date
$query = "SELECT stb_lauds_hymnus, stb_lauds_ant1, stb_lauds_ps1, stb_lauds_ps1_text, stb_lauds_ant2, stb_lauds_ps2, stb_lauds_ps2_text, stb_lauds_ant3, stb_lauds_ps3, stb_lauds_ps3_text, stb_lauds_l, stb_lauds_l_text, stb_lauds_resp, stb_lauds_antc, stb_lauds_canticum, stb_lauds_canticum_text, stb_lauds_intercessions, stb_lauds_oration, area_lit, lit_comment FROM dli_daily WHERE date = ?";

// Prepare statement and bind parameters
$stmt = $conn->prepare($query);
$stmt->bind_param('s', $date);

// Execute statement and get result
$stmt->execute();
$result = $stmt->get_result();

// Check if result contains any data
if ($result->num_rows > 0) {
    // Fetch row as associative array
    $row = $result->fetch_assoc();
    
    // Assign each column value to a variable
    $stb_lauds_hymnus = $row['stb_lauds_hymnus'];
    $stb_lauds_ant1 = $row['stb_lauds_ant1'];
    $stb_lauds_ps1 = $row['stb_lauds_ps1'];
    $stb_lauds_ps1_text = $row['stb_lauds_ps1_text'];
    $stb_lauds_ant2 = $row['stb_lauds_ant2'];
    $stb_lauds_ps2 = $row['stb_lauds_ps2'];
    $stb_lauds_ps2_text = $row['stb_lauds_ps2_text'];
    $stb_lauds_ant3 = $row['stb_lauds_ant3'];
    $stb_lauds_ps3 = $row['stb_lauds_ps3'];
    $stb_lauds_ps3_text = $row['stb_lauds_ps3_text'];
    $stb_lauds_l = $row['stb_lauds_l'];
    $stb_lauds_l_text = $row['stb_lauds_l_text'];
    $stb_lauds_resp = $row['stb_lauds_resp'];
    $stb_lauds_antc = $row['stb_lauds_antc'];
    $stb_lauds_canticum = $row['stb_lauds_canticum'];
    $stb_lauds_canticum_text = $row['stb_lauds_canticum_text'];
    $stb_lauds_intercessions = $row['stb_lauds_intercessions'];
    $stb_lauds_oration = $row['stb_lauds_oration'];
    $area_lit = $row['area_lit'];
    $lit_comment = $row['lit_comment'];
}
