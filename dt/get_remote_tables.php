<?php


$status = 200;
$response = [];

$limit = 15;
$offset = 0;

$errors = [];
$remote_data = json_decode(file_get_contents('php://input'), true);


$remote_dbhost = $remote_data['host'];
$remote_dbport = $remote_data['port'];
$remote_dbname = $remote_data['db_name'];
$remote_dbusername = $remote_data['username'];
$remote_dbpassword = $remote_data['pass'];

// var_dump( $remote_data ); exit;


try {
    $conn = new PDO('mysql:host=' . $remote_data['host'] . ':' . $remote_data['port'] . ';dbname=' . $remote_data['db_name'], $remote_data['username'], $remote_data['pass']);
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

    // $response['data'] = $result;
    $response['data'] = $table_list;
} catch (PDOException $e) {
    $status = 502;
    $response['error'][] = ['code' => $e->getCode(), 'message' => $e->getMessage()];
}

header('Content-Type: application/json');
http_response_code($status);
echo json_encode($response);
