<?php
function getDatabaseConnection() {
    $host = '';
    $dbname = '';
    $username = '';
    $password = '';
    
    try {
        $conn = new mysqli($host, $username, $password, $dbname);
        if ($conn->connect_error) {
            throw new Exception('Помилка підключення до бази: ' . $conn->connect_error);
        }
        $conn->set_charset('utf8mb4');
        return $conn;
    } catch (Exception $e) {
        error_log($e->getMessage());
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Помилка сервера']);
        exit();
    }
}
?>