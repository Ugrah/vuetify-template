<?php

// Contant to dev mode
// Replace by dynamic value from form frontend
define('DB_HOST_NAME', '127.0.0.1');
define('DB_HOST_PORT', '3306');
define('DB_USERNAME', 'root');
define('DB_PASSWORD', 'root');

define('DB_NAME', 'wownmaxmi_apm_db');


$status = 200;
$response = [];

$limit = 15;
$offset = 0;

$errors = [];
$remote_data = json_decode(file_get_contents('php://input'), true);

var_dump( $remote_data ); exit;

$remote_dbhost = DB_HOST_NAME;
$remote_dbport = DB_HOST_PORT;
$remote_dbname = DB_NAME;
$remote_dbusername = DB_USERNAME;
$remote_dbpassword = DB_PASSWORD;

try {
    $conn = new PDO('mysql:host=' . DB_HOST_NAME . ':' . DB_HOST_PORT . ';dbname=' . DB_NAME, DB_USERNAME, DB_PASSWORD);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    //Query MySQL with the PDO objecy.
    $statement = $conn->query('SHOW TABLES');
    //Fetch our result.
    $result = $statement->fetchAll(PDO::FETCH_ASSOC);


    $table_list = [];
    foreach ($result as $table) {
        $table_name = $table['Tables_in_' . $remote_dbname];

        try {
            $table_statement = $conn->query('DESCRIBE ' . $table_name);
            $table_result = $table_statement->fetchAll(PDO::FETCH_ASSOC);

            $table_list[] = ['name' => $table_name, 'schema' => $table_result];
        } catch (PDOException $e) {
            $table_list[] = ['name' => $table_name, 'schema' => null];
        }
    }

    $response['data'] = $table_list;
} catch (PDOException $e) {
    $status = 502;
    $response['error'][] = ['code' => $e->getCode(), 'message' => $e->getMessage()];
}

header('Content-Type: application/json');
http_response_code($status);
echo json_encode($response);
