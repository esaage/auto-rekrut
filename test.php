<?php
// Minimal test - no modern PHP syntax used
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "PHP Version: " . PHP_VERSION . "\n\n";

// Test mysqli
if (!function_exists('mysqli_connect')) {
    echo "ERROR: mysqli extension NOT loaded!\n";
    exit;
}
echo "mysqli: OK\n";

// Test DB connection
$host = 'localhost';
$user = 'esaageco_esa';
$pass = '58V3cBJ';
$name = 'esaageco_adek_cantik_bot';

mysqli_report(MYSQLI_REPORT_OFF);
$conn = mysqli_connect($host, $user, $pass, $name);

if (!$conn) {
    echo "DB ERROR: " . mysqli_connect_error() . "\n";
    echo "Error code: " . mysqli_connect_errno() . "\n";
} else {
    echo "DB Connection: OK\n";
    $res = mysqli_query($conn, "SHOW TABLES");
    echo "Tables:\n";
    while ($row = mysqli_fetch_array($res)) {
        echo " - " . $row[0] . "\n";
    }
    mysqli_close($conn);
}
?>
