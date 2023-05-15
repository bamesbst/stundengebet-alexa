<?php

require_once 'db_config.php';

// Open the database-connection
$conn = new mysqli(DB_HOST, DB_USER, DB_PASSWORD, DB_NAME);
$conn->set_charset("utf8");

// Check the database-connection
if ($conn->connect_error) {
    die("Verbindung fehlgeschlagen: " . $conn->connect_error);
}

$sql = "SELECT * FROM dli_daily";
$result = $conn->query($sql);

echo "<!DOCTYPE html>
<html>
<head>
<title>Beten im Alltag | Aktuelle Datenbank</title>
</head>
<body>

<h1>Aktuelle Datenbank zum Skill &quot;Beten im Alltag&quot;.</h1>
<h2>Die Daten dienen nur zu Test- und Redaktionszwecken der dazugehörigen Softwaremodule.</h2>

<table border='1'>";

if ($result->num_rows > 0) {
    // Output the data of each row
    $firstRow = true;
    while($row = $result->fetch_assoc()) {
        if ($firstRow) {
            echo "<tr>";
            foreach ($row as $key => $value) {
                echo "<th>{$key}</th>";
            }
            echo "</tr>";
            $firstRow = false;
        }
        echo "<tr>";
        foreach ($row as $value) {
            echo "<td>{$value}</td>";
        }
        echo "</tr>";
    }
} else {
    echo "0 Ergebnisse";
}

echo "</table>";

$conn->close();

?>

<footer>
<p>&copy; Stefan Bamesberger 2023 | Die Daten wurden vom Deutschen Liturgischen Institut (DLI) zur Verfügung gestellt und dürfen nur mit Genehmigung des DLI und nicht zu kommerziellen Zwecken verwendet werden.<br>
<a href="https://stundenbuch.bamesbst.de/legal/impressum.html">Impressum</a></p>
</footer>

</body>
</html>
