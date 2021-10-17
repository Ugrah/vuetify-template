<?php

define('DB_HOST_NAME', '127.0.0.1:3306');
define('DB_NAME', 'wownmaxmi_apm_db');
define('DB_USERNAME', 'root');
define('DB_PASSWORD', 'root');

$status = 200;
$response = [];


$errors = [];

$remote_dbhost = $_GET['host'];
$remote_dbport = $_GET['port'];
$remote_dbname = $_GET['db_name'];
$remote_dbtable = $_GET['table'];
$remote_dbusername = $_GET['username'];
$remote_dbpassword = $_GET['pass'];


$page = $_GET['page'];
$size = $_GET['size'];

$limit = (int) $size;
$offset = (int) $page * (int) $size;

// var_dump( $remote_dbname ); exit;
// $data = json_decode(file_get_contents('php://input'), true);

try {
    $conn = new PDO('mysql:host=' . $remote_dbhost . ':' . $remote_dbport . ';dbname=' . $remote_dbname, $remote_dbusername, $remote_dbpassword);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // var_dump( "SELECT count(*) FROM $remote_dbname" ); exit;

    // Count data
    $stmt_count = $conn->prepare("SELECT count(*) FROM $remote_dbtable");
    $stmt_count->execute();
    $count = $stmt_count->fetch(PDO::FETCH_ASSOC);



    $query = "SELECT * FROM $remote_dbtable LIMIT $limit";
    if( $offset ) $query .= " OFFSET $offset";
    $stmt = $conn->prepare($query);
    $stmt->execute();

    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $response['total'] = (int) $count['count(*)'];
    $response['totalPage'] = ceil($response['total'] / $limit);
    $response['data'] = $users;
} catch(PDOException $e) {
    $response['errors'][] = "Connection failed: " . $e->getMessage();
}


http_response_code($status);
header('Content-Type: application/json');
echo json_encode($response);